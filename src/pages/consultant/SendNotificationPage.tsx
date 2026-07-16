import { useEffect, useState } from 'react';
import type { ConsultantAccount } from '../../types';
import { getConsultantAccounts, getConsultantAccountsByRole } from '../../services/consultantAccountService';
import { sendAnnouncementToRecipients, sendBrokerAnnouncement } from '../../services/consultantNotificationService';
import { notifyCompanyAdmin } from '../../services/notificationService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';
import { SendNotificationForm } from '../../components/shared/SendNotificationForm';

type BrokerScope = 'team' | 'sales-managers' | 'company-admin';
type ManagerScope = 'team' | 'broker';
type SalesPersonScope = 'manager' | 'broker';

const BROKER_SCOPE_LABEL: Record<BrokerScope, string> = {
  team: 'your entire team (all Sales Managers and Sales Persons)',
  'sales-managers': 'your Sales Managers only',
  'company-admin': 'the Company Admin (e.g. new property or quotation needed)',
};

function accountLabel(account: ConsultantAccount | null, fallback: string): string {
  return account ? `${account.firstName} ${account.lastName} (${fallback})` : fallback;
}

/** Recipient scope differs by role: a Broker, Sales Manager, or Sales Person can all choose who up the chain to reach. */
export function SendNotificationPage() {
  const { consultantId, companyId, role } = useConsultantSession();
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [manager, setManager] = useState<ConsultantAccount | null>(null);
  const [broker, setBroker] = useState<ConsultantAccount | null>(null);
  const [resolving, setResolving] = useState(role !== 'Broker');
  const [brokerScope, setBrokerScope] = useState<BrokerScope>('team');
  const [managerScope, setManagerScope] = useState<ManagerScope>('team');
  const [salesPersonScope, setSalesPersonScope] = useState<SalesPersonScope>('manager');

  useEffect(() => {
    if (role === 'Broker') {
      setResolving(false);
      return;
    }
    setResolving(true);
    getConsultantAccounts(companyId).then((all) => {
      const me = all.find((c) => c.id === consultantId);
      if (role === 'Sales Manager') {
        const salesPersons = all.filter((c) => c.role === 'Sales Person' && c.assignedUnderId === consultantId);
        const myBroker = me?.assignedUnderId ? all.find((c) => c.id === me.assignedUnderId) : undefined;
        setRecipientIds(salesPersons.map((sp) => sp.id));
        setBroker(myBroker ?? null);
        setResolving(false);
        return;
      }
      // Sales Person
      const myManager = me?.assignedUnderId ? all.find((c) => c.id === me.assignedUnderId) : undefined;
      const myBroker = myManager?.assignedUnderId ? all.find((c) => c.id === myManager.assignedUnderId) : undefined;
      setManager(myManager ?? null);
      setBroker(myBroker ?? null);
      setResolving(false);
    });
  }, [consultantId, companyId, role]);

  async function handleSend(title: string, message: string) {
    if (role === 'Broker') {
      if (brokerScope === 'company-admin') {
        await notifyCompanyAdmin(companyId, title, message);
        return;
      }
      if (brokerScope === 'sales-managers') {
        const salesManagers = await getConsultantAccountsByRole(companyId, 'Sales Manager');
        await sendAnnouncementToRecipients(
          companyId,
          salesManagers.map((sm) => sm.id),
          title,
          message,
        );
        return;
      }
      await sendBrokerAnnouncement(companyId, title, message);
      return;
    }
    if (role === 'Sales Manager') {
      if (managerScope === 'broker') {
        await sendAnnouncementToRecipients(companyId, broker ? [broker.id] : [], title, message);
        return;
      }
      await sendAnnouncementToRecipients(companyId, recipientIds, title, message);
      return;
    }
    // Sales Person
    const target = salesPersonScope === 'broker' ? broker : manager;
    await sendAnnouncementToRecipients(companyId, target ? [target.id] : [], title, message);
  }

  const recipientLabel =
    role === 'Broker'
      ? BROKER_SCOPE_LABEL[brokerScope]
      : role === 'Sales Manager'
        ? managerScope === 'broker'
          ? accountLabel(broker, 'your Broker')
          : 'your Sales Persons'
        : salesPersonScope === 'broker'
          ? accountLabel(broker, 'your Broker')
          : accountLabel(manager, 'your Sales Manager');

  return (
    <SendNotificationForm
      recipientLabel={recipientLabel}
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
        ) : role === 'Sales Manager' ? (
          <div className="field">
            <label htmlFor="notif-scope">Send to</label>
            <select id="notif-scope" value={managerScope} onChange={(e) => setManagerScope(e.target.value as ManagerScope)}>
              <option value="team">My Sales Persons</option>
              <option value="broker">My Broker</option>
            </select>
          </div>
        ) : (
          <div className="field">
            <label htmlFor="notif-scope">Send to</label>
            <select
              id="notif-scope"
              value={salesPersonScope}
              onChange={(e) => setSalesPersonScope(e.target.value as SalesPersonScope)}
            >
              <option value="manager">My Sales Manager</option>
              <option value="broker">My Broker</option>
            </select>
          </div>
        )
      }
    />
  );
}
