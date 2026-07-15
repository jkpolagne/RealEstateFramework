import { Fragment, useEffect, useState } from 'react';
import type { Client, ConsultantAccount, Property } from '../../types';
import { getConsultantAccountsByRole } from '../../services/consultantAccountService';
import { getClients } from '../../services/clientService';
import { getAllPropertiesForAdmin } from '../../services/propertyService';
import { formatPHP } from '../../lib/format';

export function TeamOverviewPage() {
  const [salesManagers, setSalesManagers] = useState<ConsultantAccount[]>([]);
  const [salesPersons, setSalesPersons] = useState<ConsultantAccount[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getConsultantAccountsByRole('Sales Manager'),
      getConsultantAccountsByRole('Sales Person'),
      getClients(),
      getAllPropertiesForAdmin(),
    ]).then(([smResult, spResult, clientResult, propertyResult]) => {
      setSalesManagers(smResult);
      setSalesPersons(spResult);
      setClients(clientResult);
      setProperties(propertyResult);
      setLoading(false);
    });
  }, []);

  function propertyName(propertyId: string): string {
    return properties.find((p) => p.id === propertyId)?.name ?? 'Unknown property';
  }

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>Team Overview</h1>
        </div>
        <p className="text-muted">Loading team overview...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Team Overview</h1>
        <p className="text-muted">Every Sales Manager's team, sized by clients and sales volume. Click a row to see the team's Sales Persons and clients.</p>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Sales Manager</th>
              <th>Team Size</th>
              <th>Total Clients</th>
              <th>Total Sales</th>
            </tr>
          </thead>
          <tbody>
            {salesManagers.map((sm) => {
              const teamSize = salesPersons.filter((sp) => sp.assignedUnderId === sm.id).length;
              const teamClients = clients.filter((c) => c.salesManagerId === sm.id);
              const totalSales = teamClients.reduce((sum, c) => sum + c.salePrice, 0);
              const expanded = expandedId === sm.id;
              return (
                <Fragment key={sm.id}>
                  <tr className="admin-table-row-clickable" onClick={() => setExpandedId(expanded ? null : sm.id)}>
                    <td className="admin-table-expand-toggle">
                      <span className={`admin-expand-chevron${expanded ? ' admin-expand-chevron-open' : ''}`}>▸</span>
                    </td>
                    <td className="admin-table-name">
                      {sm.firstName} {sm.lastName}
                    </td>
                    <td>
                      {teamSize} Sales Person{teamSize === 1 ? '' : 's'}
                    </td>
                    <td>{teamClients.length}</td>
                    <td>{formatPHP(totalSales)}</td>
                  </tr>
                  {expanded && (
                    <tr className="admin-table-detail-row">
                      <td colSpan={5}>
                        <TeamDrilldown
                          manager={sm}
                          salesPersons={salesPersons.filter((sp) => sp.assignedUnderId === sm.id)}
                          clients={teamClients}
                          propertyName={propertyName}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface TeamDrilldownProps {
  manager: ConsultantAccount;
  salesPersons: ConsultantAccount[];
  clients: Client[];
  propertyName: (propertyId: string) => string;
}

function TeamDrilldown({ salesPersons, clients, propertyName }: TeamDrilldownProps) {
  return (
    <div className="team-drilldown">
      <div className="team-drilldown-section">
        <h4 className="team-drilldown-title">Sales Persons under this manager</h4>
        {salesPersons.length === 0 ? (
          <p className="text-muted">No Sales Persons assigned yet — this manager handles Direct Sales personally.</p>
        ) : (
          <ul className="team-drilldown-list">
            {salesPersons.map((sp) => {
              const spClients = clients.filter((c) => c.salesPersonId === sp.id);
              const spSales = spClients.reduce((sum, c) => sum + c.salePrice, 0);
              return (
                <li key={sp.id}>
                  <span className="admin-table-name">
                    {sp.firstName} {sp.lastName}
                  </span>
                  <span className="text-muted">
                    {spClients.length} client{spClients.length === 1 ? '' : 's'}
                  </span>
                  <span className="price">{formatPHP(spSales)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="team-drilldown-section">
        <h4 className="team-drilldown-title">Clients</h4>
        {clients.length === 0 ? (
          <p className="text-muted">No clients under this manager yet.</p>
        ) : (
          <table className="admin-table admin-table-nested">
            <thead>
              <tr>
                <th>Client</th>
                <th>Property</th>
                <th>Assigned To</th>
                <th>Sale Type</th>
                <th>Sale Price</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const sp = salesPersons.find((s) => s.id === client.salesPersonId);
                return (
                  <tr key={client.id}>
                    <td>{client.fullName}</td>
                    <td>{propertyName(client.propertyId)}</td>
                    <td>{sp ? `${sp.firstName} ${sp.lastName}` : 'Direct (this manager)'}</td>
                    <td>
                      <span className={`badge ${client.saleType === 'Referred' ? 'badge-reserved' : 'badge-neutral'}`}>
                        {client.saleType}
                      </span>
                    </td>
                    <td>{formatPHP(client.salePrice)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
