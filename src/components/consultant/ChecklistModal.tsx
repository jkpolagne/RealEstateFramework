import { useState } from 'react';
import type { Client } from '../../types';
import { updateChecklistItem } from '../../services/clientService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';

interface ChecklistModalProps {
  client: Client;
  onClose: () => void;
  onUpdated: () => void;
}

export function ChecklistModal({ client, onClose, onUpdated }: ChecklistModalProps) {
  const { displayName } = useConsultantSession();
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  async function handleToggle(itemId: string, checked: boolean) {
    setBusyItemId(itemId);
    await updateChecklistItem(client.id, itemId, checked, displayName);
    onUpdated();
    setBusyItemId(null);
  }

  const basicItems = client.requirementsChecklist.filter((i) => i.phase === 'Basic');
  const completeItems = client.requirementsChecklist.filter((i) => i.phase === 'Complete');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Requirements — {client.fullName}</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body scroll-y">
          <p className="text-muted">{client.paymentMethod} payment{client.employmentStatus ? ` — ${client.employmentStatus}` : ''}</p>

          <div className="checklist-section">
            <h4>Basic</h4>
            <ul className="checklist-list">
              {basicItems.map((item) => (
                <li key={item.id}>
                  <label className="checklist-row">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      disabled={busyItemId === item.id}
                      onChange={(e) => handleToggle(item.id, e.target.checked)}
                    />
                    <span>{item.label}</span>
                  </label>
                  {item.checked && item.verifiedBy && (
                    <span className="text-muted checklist-verified">
                      Verified by {item.verifiedBy} on {item.verifiedDate}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {completeItems.length > 0 && (
            <div className="checklist-section">
              <h4>Complete</h4>
              <ul className="checklist-list">
                {completeItems.map((item) => (
                  <li key={item.id}>
                    <label className="checklist-row">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        disabled={busyItemId === item.id}
                        onChange={(e) => handleToggle(item.id, e.target.checked)}
                      />
                      <span>{item.label}</span>
                    </label>
                    {item.checked && item.verifiedBy && (
                      <span className="text-muted checklist-verified">
                        Verified by {item.verifiedBy} on {item.verifiedDate}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
