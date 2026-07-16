import { useEffect, useState } from 'react';
import type { Client, CommissionVoucher, Property } from '../../types';
import { getClientsBySalesManager, getClientsBySalesPerson, updateClientContact } from '../../services/clientService';
import { getCommissionVouchers } from '../../services/commissionVoucherService';
import { getAllPropertiesForAdmin } from '../../services/propertyService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';
import { checklistPhaseStatus, nextTrancheThresholdPercent, nextTranchePhaseNeeded } from '../../lib/checklist';
import { releasedTranchesForClient } from '../../lib/tranche';
import { ChecklistModal } from '../../components/consultant/ChecklistModal';
import { SetUpClientModal } from '../../components/consultant/SetUpClientModal';

type Tab = 'view' | 'contact';

export function MonitorClientsPage() {
  const { consultantId, companyId, role } = useConsultantSession();
  const [tab, setTab] = useState<Tab>('view');
  const [clients, setClients] = useState<Client[]>([]);
  const [vouchers, setVouchers] = useState<CommissionVoucher[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [checklistClient, setChecklistClient] = useState<Client | null>(null);
  const [setupClient, setSetupClient] = useState<Client | null>(null);

  function refresh() {
    setLoading(true);
    const fetchClients = role === 'Sales Manager' ? getClientsBySalesManager(consultantId) : getClientsBySalesPerson(consultantId);
    Promise.all([fetchClients, getCommissionVouchers(companyId), getAllPropertiesForAdmin(companyId)]).then(
      ([clientResult, voucherResult, propertyResult]) => {
        setClients(clientResult);
        setVouchers(voucherResult);
        setProperties(propertyResult);
        setLoading(false);
      },
    );
  }

  useEffect(refresh, [consultantId, companyId, role]);

  function propertyName(propertyId: string): string {
    return properties.find((p) => p.id === propertyId)?.name ?? 'Unknown property';
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Monitor Clients</h1>
        <p className="text-muted">
          {role === 'Sales Manager' ? "Your team's client roster." : 'Your assigned clients.'}
        </p>
      </div>

      <div className="tabs">
        <button type="button" className={`tab${tab === 'view' ? ' tab-active' : ''}`} onClick={() => setTab('view')}>
          View Clients
        </button>
        <button type="button" className={`tab${tab === 'contact' ? ' tab-active' : ''}`} onClick={() => setTab('contact')}>
          Contact Clients
        </button>
      </div>

      <div className="tab-panel">
        {loading ? (
          <p className="text-muted">Loading clients...</p>
        ) : clients.length === 0 ? (
          <p className="text-muted">No clients assigned yet.</p>
        ) : tab === 'view' ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Property</th>
                  <th>Payment Method</th>
                  <th>Milestone Progress</th>
                  <th>Requirements</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  if (client.status === 'Pending Setup') {
                    return (
                      <tr key={client.id}>
                        <td className="admin-table-name">{client.fullName}</td>
                        <td>{propertyName(client.propertyId)}</td>
                        <td className="text-muted">Not set up yet</td>
                        <td className="text-muted">—</td>
                        <td>
                          <span className="badge badge-reserved">Pending Setup</span>
                        </td>
                        <td>
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => setSetupClient(client)}>
                            Set Up Client
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  const released = releasedTranchesForClient(client.id, vouchers);
                  const checklistStatus = checklistPhaseStatus(client.requirementsChecklist);
                  const nextThreshold = nextTrancheThresholdPercent(released, client.totalTranches);
                  const phaseNeeded = nextTranchePhaseNeeded(released, client.requirementsChecklist);
                  return (
                    <tr key={client.id}>
                      <td className="admin-table-name">{client.fullName}</td>
                      <td>{propertyName(client.propertyId)}</td>
                      <td>{client.paymentMethod}</td>
                      <td>
                        <div className="tranche-progress">
                          <span>
                            Commission milestone {released} of {client.totalTranches} released
                          </span>
                          <div className="tranche-bar">
                            <div
                              className="tranche-bar-fill"
                              style={{ width: `${client.paymentProgressPercent}%` }}
                            />
                          </div>
                          <span className="text-muted">{client.paymentProgressPercent}% paid</span>
                          {nextThreshold !== null && (
                            <span className="text-muted">
                              Next milestone at {nextThreshold}% paid
                              {client.paymentMethod === 'Bank Financing' && ' (~every 3 months)'}
                              {phaseNeeded && ` — needs ${phaseNeeded} requirements`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            checklistStatus === 'Complete'
                              ? 'badge-available'
                              : checklistStatus === 'Basic only'
                                ? 'badge-reserved'
                                : 'badge-sold'
                          }`}
                        >
                          {checklistStatus}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setChecklistClient(client)}>
                          View Checklist
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <ContactClientsTable clients={clients} onUpdated={refresh} />
        )}
      </div>

      {checklistClient && (
        <ChecklistModal
          client={checklistClient}
          onClose={() => setChecklistClient(null)}
          onUpdated={() => {
            refresh();
            setChecklistClient((current) => (current ? clients.find((c) => c.id === current.id) ?? current : current));
          }}
        />
      )}

      {setupClient && (
        <SetUpClientModal client={setupClient} onClose={() => setSetupClient(null)} onSaved={refresh} />
      )}
    </div>
  );
}

function ContactClientsTable({ clients, onUpdated }: { clients: Client[]; onUpdated: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  function startEdit(client: Client) {
    setEditingId(client.id);
    setNotes(client.notes);
  }

  async function handleSave(clientId: string) {
    setSaving(true);
    await updateClientContact(clientId, notes);
    setSaving(false);
    setEditingId(null);
    onUpdated();
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Last Contacted</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="admin-table-name">{client.fullName}</td>
              <td className="text-muted">{client.email}</td>
              <td>{client.phone}</td>
              <td>{client.lastContactedDate ?? 'Never'}</td>
              <td>
                {editingId === client.id ? (
                  <textarea rows={2} className="contact-notes-input" value={notes} onChange={(e) => setNotes(e.target.value)} />
                ) : (
                  <span className="text-muted">{client.notes || '—'}</span>
                )}
              </td>
              <td>
                {editingId === client.id ? (
                  <button type="button" className="btn btn-primary btn-sm" disabled={saving} onClick={() => handleSave(client.id)}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                ) : (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => startEdit(client)}>
                    Update Contact
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
