import { useEffect, useState } from 'react';
import { getConsultantAccounts, getConsultantAccountsByRole } from '../../services/consultantAccountService';
import { sendAnnouncementToRecipients, sendBrokerAnnouncement } from '../../services/consultantNotificationService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';
import { SendNotificationForm } from '../../components/shared/SendNotificationForm';

/** Recipient scope differs by role: Broker broadcasts to everyone, a Sales Manager messages their own Sales Persons, and a Sales Person messages their own Sales Manager. */
export function SendNotificationPage() {
  const { consultantId, role } = useConsultantSession();
  const [recipientLabel, setRecipientLabel] = useState('your team');
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [resolving, setResolving] = useState(role !== 'Broker');

  useEffect(() => {
    if (role === 'Broker') {
      setRecipientLabel('your entire team');
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
      await sendBrokerAnnouncement(title, message);
      return;
    }
    await sendAnnouncementToRecipients(recipientIds, title, message);
  }

  return <SendNotificationForm recipientLabel={recipientLabel} onSend={handleSend} resolvingRecipients={resolving} />;
}
