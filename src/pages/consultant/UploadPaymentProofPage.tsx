import { useEffect, useState } from 'react';
import type { Client } from '../../types';
import { getClientsBySalesManager, getClientsBySalesPerson, recordPayment } from '../../services/clientService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';
import { formatPHP } from '../../lib/format';

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const TODAY = new Date().toISOString().slice(0, 10);

export function UploadPaymentProofPage() {
  const { consultantId, role } = useConsultantSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(TODAY);
  const [method, setMethod] = useState('Bank transfer');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<{ progress: number; newTranchesDue: number } | null>(null);

  async function handleProofFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setProofImage(await readAsDataUrl(file));
  }

  useEffect(() => {
    const fetchClients = role === 'Sales Manager' ? getClientsBySalesManager(consultantId) : getClientsBySalesPerson(consultantId);
    fetchClients.then((result) => {
      setClients(result);
      if (result.length > 0) setClientId(result[0].id);
    });
  }, [consultantId, role]);

  const selectedClient = clients.find((c) => c.id === clientId) ?? null;
  const remainingBalance = selectedClient
    ? Math.round(selectedClient.salePrice * (1 - selectedClient.paymentProgressPercent / 100))
    : 0;
  const amountExceedsBalance = Boolean(selectedClient) && (Number(amount) || 0) > remainingBalance;

  function resetForm() {
    setAmount('');
    setProofImage(null);
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient || !proofImage) return;
    setValidationError(null);
    if (amountExceedsBalance) {
      setValidationError(
        `Amount (${formatPHP(Number(amount) || 0)}) can't exceed ${selectedClient.fullName}'s remaining balance (${formatPHP(remainingBalance)}).`,
      );
      return;
    }
    setSubmitting(true);
    const { client, newTranchesDue } = await recordPayment({
      clientId: selectedClient.id,
      amount: Number(amount),
      paymentDate,
      method,
      proofImage,
      uploadedById: consultantId,
    });
    setSubmitting(false);
    setResult({ progress: client.paymentProgressPercent, newTranchesDue });
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
  }

  if (result) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>Upload Payment Proof</h1>
        </div>
        <div className="card admin-confirmation">
          <p className="admin-confirmation-title">Payment recorded</p>
          <p className="text-muted">
            {selectedClient?.fullName} is now at <strong>{result.progress}%</strong> paid.
          </p>
          {result.newTranchesDue > 0 ? (
            <p className="text-muted">
              This crossed a new milestone — the Broker has been notified that a commission voucher is now due.
            </p>
          ) : (
            <p className="text-muted">No new tranche threshold was crossed by this payment.</p>
          )}
          <button type="button" className="btn btn-primary btn-block" onClick={resetForm}>
            Upload Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Upload Payment Proof</h1>
        <p className="text-muted">Record a client payment and recompute their milestone progress.</p>
      </div>

      <form className="admin-form card admin-form-card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="payment-client">Client</label>
          <select id="payment-client" required value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.fullName} — {client.paymentMethod}
              </option>
            ))}
          </select>
        </div>

        {selectedClient && (
          <div className="field">
            <label>Current progress</label>
            <p className="text-muted">
              {selectedClient.paymentProgressPercent}% of {formatPHP(selectedClient.salePrice)} paid — {formatPHP(remainingBalance)}{' '}
              remaining
            </p>
          </div>
        )}

        <div className="field-row">
          <div className="field">
            <label htmlFor="payment-amount">Amount (₱)</label>
            <input
              id="payment-amount"
              type="number"
              min={0}
              max={selectedClient ? remainingBalance : undefined}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {amountExceedsBalance && <p className="field-help field-help-danger">Exceeds the remaining balance.</p>}
          </div>
          <div className="field">
            <label htmlFor="payment-date">Payment date</label>
            <input
              id="payment-date"
              type="date"
              required
              max={TODAY}
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="payment-method">Method</label>
          <select id="payment-method" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>Bank transfer</option>
            <option>Cash</option>
            <option>Check</option>
            <option>Online payment</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="payment-proof">Proof of payment</label>
          <input
            id="payment-proof"
            type="file"
            accept="image/*"
            required={!proofImage}
            onChange={(e) => handleProofFile(e.target.files)}
          />
          <p className="text-muted field-help">Upload a photo or scan of the receipt / deposit slip the buyer gave you.</p>
          {proofImage && (
            <div className="image-upload-preview">
              <div className="image-upload-thumb">
                <img src={proofImage} alt="Proof of payment" />
                <button type="button" className="image-upload-remove" onClick={() => setProofImage(null)} aria-label="Remove proof">
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {validationError && <p className="form-error">{validationError}</p>}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting || !selectedClient || !proofImage || amountExceedsBalance}
        >
          {submitting ? 'Saving...' : 'Save Payment'}
        </button>
      </form>
    </div>
  );
}
