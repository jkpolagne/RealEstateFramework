import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Developer, VoucherRole } from '../../types';
import { getClients } from '../../services/clientService';
import { getCommissionVouchers, computeReleasableTranches, previewVoucherAmounts, createCommissionVoucher } from '../../services/commissionVoucherService';
import { getConsultantAccounts } from '../../services/consultantAccountService';
import { getAllDevelopers } from '../../services/developerService';
import { BLOCK_LOT_BY_PROPERTY } from '../../lib/blockLot';
import { formatPHP } from '../../lib/format';
import { useConsultantSession } from '../../context/ConsultantSessionContext';

export function CreateCommissionVoucherPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { displayName: brokerName, companyId } = useConsultantSession();

  const [releasable, setReleasable] = useState<ReturnType<typeof computeReleasableTranches>>([]);
  const [consultantNames, setConsultantNames] = useState<Record<string, string>>({});
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [blockLot, setBlockLot] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [bank, setBank] = useState('');
  const [dateDisbursed, setDateDisbursed] = useState(new Date().toISOString().slice(0, 10));
  const [adcom, setAdcom] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getClients(companyId), getCommissionVouchers(companyId), getConsultantAccounts(companyId), getAllDevelopers(companyId)]).then(
      ([clientResult, voucherResult, consultants, developerResult]) => {
      const items = computeReleasableTranches(clientResult, voucherResult);
      setReleasable(items);
      setConsultantNames(Object.fromEntries(consultants.map((c) => [c.id, `${c.firstName} ${c.lastName}`])));
      setDevelopers(developerResult);
      setLoading(false);

      const preselectClientId = searchParams.get('clientId');
      const preselectRole = searchParams.get('role');
      const preselectRelease = searchParams.get('release');
      if (preselectClientId && preselectRole && preselectRelease) {
        setSelectedKey(`${preselectClientId}|${preselectRole}|${preselectRelease}`);
      } else if (items.length > 0) {
        const first = items[0];
        setSelectedKey(`${first.client.id}|${first.role}|${first.releaseNumber}`);
      }
    });
  }, [searchParams, companyId]);

  const selected = useMemo(() => {
    if (!selectedKey) return null;
    const [clientId, role, releaseStr] = selectedKey.split('|');
    return releasable.find((r) => r.client.id === clientId && r.role === role && String(r.releaseNumber) === releaseStr) ?? null;
  }, [selectedKey, releasable]);

  useEffect(() => {
    if (selected) setBlockLot(BLOCK_LOT_BY_PROPERTY[selected.client.propertyId] ?? '');
  }, [selected]);

  const preview = selected ? previewVoucherAmounts(selected.client, selected.role as VoucherRole, Number(adcom) || 0) : null;
  const adcomExceedsGross = Boolean(preview) && (Number(adcom) || 0) > (preview?.grossCommission ?? 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setValidationError(null);
    if (adcomExceedsGross) {
      setValidationError(
        `ADCOM (${formatPHP(Number(adcom) || 0)}) can't exceed the gross commission (${formatPHP(preview?.grossCommission ?? 0)}).`,
      );
      return;
    }
    setSubmitting(true);
    await createCommissionVoucher({
      client: selected.client,
      role: selected.role,
      consultantId: selected.consultantId,
      consultantName: consultantNames[selected.consultantId] ?? 'Unknown Consultant',
      releaseNumber: selected.releaseNumber,
      blockLot,
      checkNumber,
      bank,
      adcom: Number(adcom) || 0,
      dateDisbursed,
    });
    setSubmitting(false);
    setCreated(true);
  }

  if (created) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>Create Commission Voucher</h1>
        </div>
        <div className="card admin-confirmation">
          <p className="admin-confirmation-title">Voucher created</p>
          <p className="text-muted">
            Sent to {selected && consultantNames[selected.consultantId]} for signature.
          </p>
          <div className="admin-confirmation-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/broker/releasable-commission')}>
              Back to Releasable Commission
            </button>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/broker/all-commission-vouchers')}>
              View All Vouchers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Create Commission Voucher</h1>
        <p className="text-muted">Select a releasable tranche, review the breakdown, and complete the voucher.</p>
      </div>

      {loading ? (
        <p className="text-muted">Loading releasable tranches...</p>
      ) : releasable.length === 0 ? (
        <p className="text-muted">No tranches are currently due for a voucher.</p>
      ) : (
        <form className="admin-form card admin-form-card admin-voucher-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="voucher-select">Consultant / tranche</label>
            <select id="voucher-select" required value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)}>
              {releasable.map((item) => {
                const key = `${item.client.id}|${item.role}|${item.releaseNumber}`;
                return (
                  <option key={key} value={key}>
                    {item.client.fullName} — {item.role} ({consultantNames[item.consultantId]}) — Release {item.releaseNumber} of{' '}
                    {item.client.totalTranches}
                  </option>
                );
              })}
            </select>
          </div>

          {selected && preview && (
            <>
              <fieldset className="admin-fieldset">
                <legend>Sale details</legend>
                <div className="field-row">
                  <div className="field">
                    <label>Developer</label>
                    <p className="admin-readonly-value">
                      {developers.find((d) => d.id === selected.client.developerId)?.name ?? 'Unknown Developer'}
                    </p>
                  </div>
                </div>
                <div className="field-row field-row-3">
                  <div className="field">
                    <label>Buyer</label>
                    <p className="admin-readonly-value">{selected.client.fullName}</p>
                  </div>
                  <div className="field">
                    <label>RS Date</label>
                    <p className="admin-readonly-value">{selected.client.addedDate}</p>
                  </div>
                  <div className="field">
                    <label>NTCP</label>
                    <p className="admin-readonly-value">{formatPHP(selected.client.salePrice)}</p>
                  </div>
                </div>
                <div className="field-row field-row-3">
                  <div className="field">
                    <label>Release Number</label>
                    <p className="admin-readonly-value">
                      {selected.releaseNumber} of {selected.client.totalTranches}
                    </p>
                  </div>
                  <div className="field">
                    <label>Rate</label>
                    <p className="admin-readonly-value">{preview.rate}%</p>
                  </div>
                  <div className="field">
                    <label>Paid To</label>
                    <p className="admin-readonly-value">{consultantNames[selected.consultantId]}</p>
                  </div>
                </div>
              </fieldset>

              <fieldset className="admin-fieldset">
                <legend>Voucher details</legend>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="voucher-block-lot">Block / Lot</label>
                    <input id="voucher-block-lot" type="text" required value={blockLot} onChange={(e) => setBlockLot(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="voucher-date">Date disbursed</label>
                    <input
                      id="voucher-date"
                      type="date"
                      required
                      value={dateDisbursed}
                      onChange={(e) => setDateDisbursed(e.target.value)}
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="voucher-check">Check number</label>
                    <input id="voucher-check" type="text" required value={checkNumber} onChange={(e) => setCheckNumber(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="voucher-bank">Bank</label>
                    <input id="voucher-bank" type="text" required value={bank} onChange={(e) => setBank(e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="voucher-adcom">Less ADCOM (₱)</label>
                  <input
                    id="voucher-adcom"
                    type="number"
                    min={0}
                    max={preview?.grossCommission}
                    value={adcom}
                    onChange={(e) => setAdcom(e.target.value)}
                  />
                  {adcomExceedsGross && <p className="field-help field-help-danger">Can't exceed the gross commission.</p>}
                </div>
              </fieldset>

              <fieldset className="admin-fieldset">
                <legend>Computed breakdown</legend>
                <dl className="quotation-breakdown">
                  <div>
                    <dt>Gross commission</dt>
                    <dd>{formatPHP(preview.grossCommission)}</dd>
                  </div>
                  <div>
                    <dt>Less EWT</dt>
                    <dd>{formatPHP(preview.lessEwt)}</dd>
                  </div>
                  <div>
                    <dt>Less ADCOM</dt>
                    <dd>{formatPHP(preview.lessAdcom)}</dd>
                  </div>
                  <div>
                    <dt>Total commission due</dt>
                    <dd>{formatPHP(preview.totalCommissionDue)}</dd>
                  </div>
                  <div>
                    <dt>Less misc. tax</dt>
                    <dd>{formatPHP(preview.lessMiscTax)}</dd>
                  </div>
                  <div>
                    <dt>Net commission receivable</dt>
                    <dd className="admin-net-receivable">{formatPHP(preview.netCommissionReceivable)}</dd>
                  </div>
                </dl>
                <p className="text-muted">
                  Approved by: {brokerName} (on release) · Received by: {consultantNames[selected.consultantId]} (on signature)
                </p>
              </fieldset>

              {validationError && <p className="form-error">{validationError}</p>}

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting || adcomExceedsGross}>
                {submitting ? 'Creating...' : 'Create Voucher'}
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );
}
