import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Client, CommissionVoucher, ConsultantAccount } from '../../types';
import { getClients } from '../../services/clientService';
import { getConsultantAccounts } from '../../services/consultantAccountService';
import {
  getCommissionVouchers,
  computeReleasableTranches,
  computeHeldTranches,
  type ReleasableTranche,
} from '../../services/commissionVoucherService';
import { ChecklistModal } from '../../components/consultant/ChecklistModal';
import { useConsultantSession } from '../../context/ConsultantSessionContext';

export function ReleasableCommissionPage() {
  const navigate = useNavigate();
  const { companyId } = useConsultantSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [vouchers, setVouchers] = useState<CommissionVoucher[]>([]);
  const [consultants, setConsultants] = useState<ConsultantAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [checklistClient, setChecklistClient] = useState<Client | null>(null);

  function refresh() {
    Promise.all([getClients(companyId), getCommissionVouchers(companyId), getConsultantAccounts(companyId)]).then(([clientResult, voucherResult, consultantResult]) => {
      setClients(clientResult);
      setVouchers(voucherResult);
      setConsultants(consultantResult);
      setLoading(false);
    });
  }

  useEffect(refresh, [companyId]);

  const releasable: ReleasableTranche[] = computeReleasableTranches(clients, vouchers);
  const held = computeHeldTranches(clients, vouchers);

  function consultantName(id: string): string {
    const c = consultants.find((a) => a.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Unknown Consultant';
  }

  function handleCreate(item: ReleasableTranche) {
    navigate(
      `/broker/create-commission-voucher?clientId=${item.client.id}&role=${encodeURIComponent(item.role)}&release=${item.releaseNumber}`,
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Releasable Commission</h1>
        <p className="text-muted">Tranches whose payment milestone has been reached and are ready for a voucher.</p>
      </div>

      {loading ? (
        <p className="text-muted">Loading releasable commissions...</p>
      ) : releasable.length === 0 ? (
        <p className="text-muted">No tranches are currently due for a voucher.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Payment Method</th>
                <th>Consultant</th>
                <th>Role</th>
                <th>Release</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {releasable.map((item) => (
                <tr key={`${item.client.id}-${item.role}-${item.releaseNumber}`}>
                  <td className="admin-table-name">{item.client.fullName}</td>
                  <td>{item.client.paymentMethod}</td>
                  <td>{consultantName(item.consultantId)}</td>
                  <td>{item.role}</td>
                  <td>
                    {item.releaseNumber} of {item.client.totalTranches}
                  </td>
                  <td>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => handleCreate(item)}>
                      Create Voucher
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="admin-page-header admin-page-header-secondary">
        <h2>Held — Pending Requirements</h2>
        <p className="text-muted">Payment milestone reached, but the requirements checklist isn't caught up yet.</p>
      </div>

      {held.length === 0 ? (
        <p className="text-muted">Nothing is being held on requirements right now.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Payment Method</th>
                <th>Release</th>
                <th>Requirements</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {held.map((item) => (
                <tr key={`${item.client.id}-${item.releaseNumber}`}>
                  <td className="admin-table-name">{item.client.fullName}</td>
                  <td>{item.client.paymentMethod}</td>
                  <td>
                    {item.releaseNumber} of {item.client.totalTranches}
                  </td>
                  <td>
                    <span
                      className={`badge ${item.checklistStatus === 'Basic only' ? 'badge-reserved' : 'badge-sold'}`}
                    >
                      {item.checklistStatus}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setChecklistClient(item.client)}>
                      View Checklist
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
    </div>
  );
}
