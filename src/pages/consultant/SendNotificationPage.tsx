import { useEffect, useState } from 'react';
import { getConsultantAccounts, getConsultantAccountsByRole } from '../../services/consultantAccountService';
import { sendAnnouncementToRecipients, sendBrokerAnnouncement } from '../../services/consultantNotificationService';
import { notifyCompanyAdmin } from '../../services/notificationService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';
import { SendNotificationForm } from '../../components/shared/SendNotificationForm';

type BrokerScope = 'team' | 'sales-managers' | 'company-admin';

const BROKER_SCOPE_LABEL: Record<BrokerScope, string> = {
  team: 'your entire team (all Sales Managers and Sales Persons)',
  'sales-managers': 'your Sales Managers only',
  'company-admin': 'the Company Admin (e.g. new property or quotation needed)',
};

/** Recipient scope differs by role: a Broker can choose who to reach, a Sales Manager messages their own Sales Persons, and a Sales Person messages their own Sales Manager. */
export function SendNotificationPage() {
  const { consultantId, role } = useConsultantSession();
  const [recipientLabel, setRecipientLabel] = useState('your team');
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [resolving, setResolving] = useState(role !== 'Broker');
  const [brokerScope, setBrokerScope] = useState<BrokerScope>('team');

  useEffect(() => {
    if (role === 'Broker') {
      setResolving(false);
      return;
    }
    setResolving(true);
    if (role === 'Sales Manager') {
      getConsultantAccountsByRole('Sales Person').then((salesPersons) => {
        const mine = salesPersons.filter((sp) => sp.assignedUnderId === consultantId);
        setRecipientIds(mine.map((sp) => sp.id));
        setRecipientLabel('your Sales Persons');
        setResolving(false);
      });
      return;
    }
    getConsultantAccounts().then((all) => {
      const me = all.find((c) => c.id === consultantId);
      const manager = me?.assignedUnderId ? all.find((c) => c.id === me.assignedUnderId) : undefined;
      setRecipientIds(manager ? [manager.id] : []);
      setRecipientLabel(manager ? `${manager.firstName} ${manager.lastName} (your Sales Manager)` : 'your Sales Manager');
      setResolving(false);
    });
  }, [consultantId, role]);

  async function handleSend(title: string, message: string) {
    if (role === 'Broker') {
      if (brokerScope === 'company-admin') {
        await notifyCompanyAdmin(title, message);
        return;
      }
      if (brokerScope === 'sales-managers') {
        const salesManagers = await getConsultantAccountsByRole('Sales Manager');
        await sendAnnouncementToRecipients(
          salesManagers.map((sm) => sm.id),
          title,
          message,
        );
        return;
      }
      await sendBrokerAnnouncement(title, message);
      return;
    }
    await sendAnnouncementToRecipients(recipientIds, title, message);
  }

  return (
    <SendNotificationForm
      recipientLabel={role === 'Broker' ? BROKER_SCOPE_LABEL[brokerScope] : recipientLabel}
      onSend={handleSend}
      resolvingRecipients={resolving}
      scopeControl={
        role === 'Broker' ? (
          <div className="field">
            <label htmlFor="notif-scope">Send to</label>
            <select id="notif-scope" value={brokerScope} onChange={(e) => setBrokerScope(e.target.value as BrokerScope)}>
              <option value="team">Entire team (Sales Managers + Sales Persons)</option>
              <option value="sales-managers">Sales Managers only</option>
              <option value="company-admin">Company Admin</option>
            </select>
          </div>
        ) : undefined
      }
    />
  );
}
