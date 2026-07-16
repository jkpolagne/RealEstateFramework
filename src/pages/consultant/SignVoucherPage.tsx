import { useEffect, useState } from 'react';
import type { CommissionVoucher } from '../../types';
import { disputeVoucher, getVouchersByConsultant, signVoucher } from '../../services/commissionVoucherService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';
import { formatPHP } from '../../lib/format';
import { SignaturePad } from '../../components/shared/SignaturePad';

export function SignVoucherPage() {
  const { consultantId, displayName } = useConsultantSession();
  const [vouchers, setVouchers] = useState<CommissionVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [disputingId, setDisputingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [signingId, setSigningId] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    getVouchersByConsultant(consultantId).then((result) => {
      setVouchers(result.filter((v) => v.status === 'Pending Signature'));
      setLoading(false);
    });
  }

  useEffect(refresh, [consultantId]);

  async function handleConfirmSign(id: string) {
    if (!signatureDataUrl) return;
    setActingId(id);
    await signVoucher(id, displayName, signatureDataUrl);
    setSigningId(null);
    setSignatureDataUrl(null);
    refresh();
    setActingId(null);
  }

  async function handleSubmitDispute(id: string) {
    if (!disputeReason.trim()) return;
    setActingId(id);
    await disputeVoucher(id, disputeReason);
    setDisputingId(null);
    setDisputeReason('');
    refresh();
    setActingId(null);
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Sign Voucher</h1>
        <p className="text-muted">Commission vouchers awaiting your signature before they can be released.</p>
      </div>

      {loading ? (
        <p className="text-muted">Loading vouchers...</p>
      ) : vouchers.length === 0 ? (
        <p className="text-muted">No vouchers awaiting signature.</p>
      ) : (
        <div className="voucher-sign-list">
          {vouchers.map((voucher) => (
            <div key={voucher.id} className="card voucher-sign-card">
              <div className="voucher-sign-header">
                <div>
                  <p className="admin-table-name">{voucher.buyerName}</p>
                  <p className="text-muted">
                    {voucher.developerName} — Release {voucher.releaseNumber} of {voucher.totalReleases}
                  </p>
                </div>
                <span className="price price-lg">{formatPHP(voucher.netCommissionReceivable)}</span>
              </div>

              <dl className="quotation-breakdown">
                <div>
                  <dt>Rate</dt>
                  <dd>{voucher.ratePercent}%</dd>
                </div>
                <div>
                  <dt>Gross commission</dt>
                  <dd>{formatPHP(voucher.grossCommission)}</dd>
                </div>
                <div>
                  <dt>Less EWT</dt>
                  <dd>{formatPHP(voucher.lessEwt)}</dd>
                </div>
                <div>
                  <dt>Less misc. tax</dt>
                  <dd>{formatPHP(voucher.lessMiscTax)}</dd>
                </div>
              </dl>

              {disputingId === voucher.id ? (
                <div className="voucher-dispute-form">
                  <textarea
                    rows={2}
                    placeholder="Reason for dispute..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                  />
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={actingId === voucher.id}
                      onClick={() => handleSubmitDispute(voucher.id)}
                    >
                      Submit Dispute
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDisputingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : signingId === voucher.id ? (
                <div className="voucher-dispute-form">
                  <SignaturePad onChange={setSignatureDataUrl} />
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={actingId === voucher.id || !signatureDataUrl}
                      onClick={() => handleConfirmSign(voucher.id)}
                    >
                      {actingId === voucher.id ? 'Signing...' : 'Confirm & Sign'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setSigningId(null);
                        setSignatureDataUrl(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="admin-row-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={actingId === voucher.id}
                    onClick={() => {
                      setSigningId(voucher.id);
                      setSignatureDataUrl(null);
                    }}
                  >
                    Accept &amp; Sign
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setDisputingId(voucher.id)}>
                    Dispute
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
