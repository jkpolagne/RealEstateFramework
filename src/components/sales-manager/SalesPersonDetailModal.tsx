import { useEffect, useState } from 'react';
import type { Client, CommissionVoucher, ConsultantAccount, Property } from '../../types';
import { getClientsBySalesPerson } from '../../services/clientService';
import { getVouchersByConsultant } from '../../services/commissionVoucherService';
import { getAllPropertiesForAdmin } from '../../services/propertyService';
import { formatPHP } from '../../lib/format';

interface SalesPersonDetailModalProps {
  salesPerson: ConsultantAccount;
  onClose: () => void;
}

export function SalesPersonDetailModal({ salesPerson, onClose }: SalesPersonDetailModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [vouchers, setVouchers] = useState<CommissionVoucher[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClientsBySalesPerson(salesPerson.id), getVouchersByConsultant(salesPerson.id), getAllPropertiesForAdmin()]).then(
      ([clientResult, voucherResult, propertyResult]) => {
        setClients(clientResult);
        setVouchers(voucherResult);
        setProperties(propertyResult);
        setLoading(false);
      },
    );
  }, [salesPerson.id]);

  function propertyName(propertyId: string): string {
    return properties.find((p) => p.id === propertyId)?.name ?? 'Unknown property';
  }

  function commissionEarned(clientId: string): number {
    return vouchers
      .filter((v) => v.clientId === clientId && v.status === 'Released')
      .reduce((sum, v) => sum + v.netCommissionReceivable, 0);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {salesPerson.firstName} {salesPerson.lastName}
          </h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body scroll-y">
          {loading ? (
            <p className="text-muted">Loading clients...</p>
          ) : clients.length === 0 ? (
            <p className="text-muted">No clients assigned yet.</p>
          ) : (
            <table className="admin-table admin-table-plain">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Property</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Commission Earned</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="admin-table-name">{client.fullName}</td>
                    <td>{propertyName(client.propertyId)}</td>
                    <td>{client.paymentProgressPercent === 100 ? 'Fully paid' : `${client.paymentProgressPercent}% paid`}</td>
                    <td>{client.addedDate}</td>
                    <td>{formatPHP(commissionEarned(client.id))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
