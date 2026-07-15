import type { CommissionVoucher, VoucherStatus } from '../../types';
import { formatPHP } from '../../lib/format';

interface VoucherDetailsModalProps {
  voucher: CommissionVoucher;
  onClose: () => void;
}

function statusBadgeClass(status: VoucherStatus): string {
  if (status === 'Released') return 'badge-available';
  if (status === 'Signed') return 'badge-reserved';
  if (status === 'Disputed') return 'badge-sold';
  return 'badge-neutral';
}

export function VoucherDetailsModal({ voucher, onClose }: VoucherDetailsModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal voucher-receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Commission Voucher</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body scroll-y">
          <div className="voucher-receipt">
            <div className="voucher-receipt-top">
              <div>
                <p className="voucher-receipt-buyer">{voucher.buyerName}</p>
                <p className="text-muted">
                  {voucher.developerName} — Release {voucher.releaseNumber} of {voucher.totalReleases}
                </p>
              </div>
              <span className={`badge ${statusBadgeClass(voucher.status)}`}>{voucher.status}</span>
            </div>

            <div className="voucher-receipt-section">
              <h4 className="team-drilldown-title">Sale details</h4>
              <div className="voucher-receipt-row">
                <span>Paid to</span>
                <span>{voucher.paidTo}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Role</span>
                <span>{voucher.role}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Consultant</span>
                <span>{voucher.consultantName}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>RS date</span>
                <span>{voucher.rsDate}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>NTCP</span>
                <span>{formatPHP(voucher.ntcp)}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Block / Lot</span>
                <span>{voucher.blockLot}</span>
              </div>
            </div>

            <div className="voucher-receipt-section">
              <h4 className="team-drilldown-title">Financial breakdown</h4>
              <div className="voucher-receipt-row">
                <span>Rate</span>
                <span>{voucher.ratePercent}%</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Gross commission</span>
                <span>{formatPHP(voucher.grossCommission)}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Less EWT</span>
                <span>-{formatPHP(voucher.lessEwt)}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Released from</span>
                <span>{voucher.grossCommissionReleasedFrom}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Less ADCOM</span>
                <span>-{formatPHP(voucher.lessAdcom)}</span>
              </div>
              <div className="voucher-receipt-row voucher-receipt-row-strong">
                <span>Total commission due</span>
                <span>{formatPHP(voucher.totalCommissionDue)}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Less misc. tax</span>
                <span>-{formatPHP(voucher.lessMiscTax)}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Other deductions</span>
                <span>-{formatPHP(voucher.otherDeductions)}</span>
              </div>
              <div className="voucher-receipt-row voucher-receipt-row-total">
                <span>Net commission receivable</span>
                <span>{formatPHP(voucher.netCommissionReceivable)}</span>
              </div>
            </div>

            <div className="voucher-receipt-section">
              <h4 className="team-drilldown-title">Disbursement</h4>
              <div className="voucher-receipt-row">
                <span>Check number</span>
                <span>{voucher.checkNumber || '—'}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Bank</span>
                <span>{voucher.bank || '—'}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Date disbursed</span>
                <span>{voucher.dateDisbursed ?? '—'}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Approved by (Broker)</span>
                <span>{voucher.approvedByBroker ?? '—'}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Received by (Consultant)</span>
                <span>{voucher.receivedByConsultant ?? '—'}</span>
              </div>
              <div className="voucher-receipt-row">
                <span>Signed date</span>
                <span>{voucher.signedDate ?? '—'}</span>
              </div>
              {voucher.signatureDataUrl && (
                <div className="voucher-receipt-signature">
                  <span className="text-muted">E-signature</span>
                  <img src={voucher.signatureDataUrl} alt="Consultant signature" />
                </div>
              )}
              <div className="voucher-receipt-row">
                <span>Released date</span>
                <span>{voucher.releasedDate ?? '—'}</span>
              </div>
              {voucher.status === 'Disputed' && voucher.disputeReason && (
                <div className="voucher-receipt-row">
                  <span>Dispute reason</span>
                  <span>{voucher.disputeReason}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
