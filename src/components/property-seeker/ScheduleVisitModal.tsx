import { useState } from 'react';
import { submitVisitRequest } from '../../services/visitService';
import { useConsultantLink } from '../../context/ConsultantLinkContext';

interface ScheduleVisitModalProps {
  propertyId: string;
  propertyName: string;
  onClose: () => void;
}

export function ScheduleVisitModal({ propertyId, propertyName, onClose }: ScheduleVisitModalProps) {
  const { activeLink } = useConsultantLink();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await submitVisitRequest({
      propertyId,
      fullName,
      email,
      phone,
      preferredDate,
      preferredTime,
      notes,
      sourceLinkId: activeLink?.id ?? null,
    });
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal schedule-visit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Schedule Visit</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {submitted ? (
            <div className="visit-confirmation">
              <p className="visit-confirmation-title">Request submitted — please wait within 24 hours for schedule confirmation</p>
              <p className="text-muted">We'll reach out to confirm your visit to {propertyName}.</p>
              <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="schedule-visit-form">
              <p className="text-muted">{propertyName}</p>
              <div className="field">
                <label htmlFor="visit-name">Full name</label>
                <input id="visit-name" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="visit-email">Email address</label>
                <input id="visit-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="visit-phone">Phone number</label>
                <input id="visit-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="visit-date">Preferred date</label>
                  <input
                    id="visit-date"
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="visit-time">Preferred time</label>
                  <input
                    id="visit-time"
                    type="time"
                    required
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="visit-notes">Notes</label>
                <textarea id="visit-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
