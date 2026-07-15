import { useState } from 'react';

interface SendNotificationFormProps {
  recipientLabel: string;
  onSend: (title: string, message: string) => Promise<void>;
  /** True while the recipient scope is still being resolved — blocks submission so a message can't silently go to nobody. */
  resolvingRecipients?: boolean;
}

export function SendNotificationForm({ recipientLabel, onSend, resolvingRecipients }: SendNotificationFormProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await onSend(title, message);
    setSending(false);
    setSent(true);
    setTitle('');
    setMessage('');
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Send Notification</h1>
        <p className="text-muted">Send an announcement or meeting notice to {recipientLabel}.</p>
      </div>

      <form className="admin-form card admin-form-card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="notif-title">Title</label>
          <input id="notif-title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="notif-message">Message</label>
          <textarea id="notif-message" rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={sending || resolvingRecipients}>
          {sending ? 'Sending...' : resolvingRecipients ? 'Loading recipients...' : 'Send'}
        </button>
        {sent && <p className="text-muted admin-form-hint">Sent to {recipientLabel}.</p>}
      </form>
    </div>
  );
}
