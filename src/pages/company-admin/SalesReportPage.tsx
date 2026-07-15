import { useEffect, useMemo, useState } from 'react';
import type { ConsultantAccount, Developer, Property, Sale } from '../../types';
import { getSales, buildSalesReport, propertyName } from '../../services/saleService';
import { getAllDevelopers } from '../../services/developerService';
import { getConsultantAccounts } from '../../services/consultantAccountService';
import { getAllPropertiesForAdmin } from '../../services/propertyService';
import { StatTile } from '../../components/shared/StatTile';
import { RankedList } from '../../components/shared/RankedList';
import { formatPHP } from '../../lib/format';
import { downloadCsv } from '../../lib/csv';

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return isoDate(d);
}

export function SalesReportPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [consultants, setConsultants] = useState<ConsultantAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(defaultFrom());
  const [dateTo, setDateTo] = useState(isoDate(new Date()));

  useEffect(() => {
    Promise.all([getSales(), getAllPropertiesForAdmin(), getAllDevelopers(), getConsultantAccounts()]).then(
      ([saleResult, propertyResult, developerResult, consultantResult]) => {
        setSales(saleResult);
        setProperties(propertyResult);
        setDevelopers(developerResult);
        setConsultants(consultantResult);
        setLoading(false);
      },
    );
  }, []);

  const salesInRange = useMemo(
    () => sales.filter((s) => s.saleDate >= dateFrom && s.saleDate <= dateTo),
    [sales, dateFrom, dateTo],
  );

  const report = useMemo(
    () => buildSalesReport(salesInRange, developers, consultants),
    [salesInRange, developers, consultants],
  );

  function handleDownload() {
    const rows = [
      ['Date', 'Property', 'Developer', 'Buyer', 'Sale Type', 'Price'],
      ...salesInRange.map((sale) => [
        sale.saleDate,
        propertyName(sale, properties),
        developers.find((d) => d.id === sale.developerId)?.name ?? 'Unknown Developer',
        sale.buyerName,
        sale.saleType,
        String(sale.salePrice),
      ]),
    ];
    downloadCsv(`sales-report_${dateFrom}_to_${dateTo}.csv`, rows);
  }

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>Sales Report</h1>
        </div>
        <p className="text-muted">Loading sales report...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Sales Report</h1>
        <p className="text-muted">Sales performance across developers and the consultant team.</p>
      </div>

      <div className="admin-toolbar">
        <div className="field">
          <label htmlFor="report-from">From</label>
          <input id="report-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="report-to">To</label>
          <input id="report-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <button type="button" className="btn btn-outline" onClick={handleDownload} disabled={salesInRange.length === 0}>
          Download CSV
        </button>
      </div>

      <div className="stat-tile-row">
        <StatTile label="Total sales (selected range)" value={formatPHP(report.totalSales)} accent />
        <StatTile label="Number of sales" value={String(report.saleCount)} />
      </div>

      <div className="admin-dashboard-grid">
        <div className="card admin-dashboard-panel">
          <h3>Sales by developer</h3>
          {report.byDeveloper.length === 0 ? (
            <p className="text-muted">No sales in this date range.</p>
          ) : (
            <table className="admin-table admin-table-plain">
              <thead>
                <tr>
                  <th>Developer</th>
                  <th>Sales</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {report.byDeveloper.map((row) => (
                  <tr key={row.developerId}>
                    <td className="admin-table-name">{row.developerName}</td>
                    <td>{row.saleCount}</td>
                    <td>{formatPHP(row.totalSales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card admin-dashboard-panel">
          <h3>Sales by consultant</h3>
          {report.byConsultant.length === 0 ? (
            <p className="text-muted">No sales in this date range.</p>
          ) : (
            <table className="admin-table admin-table-plain">
              <thead>
                <tr>
                  <th>Consultant</th>
                  <th>Sales</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {report.byConsultant.map((row) => (
                  <tr key={row.consultantId}>
                    <td className="admin-table-name">{row.consultantName}</td>
                    <td>{row.saleCount}</td>
                    <td>{formatPHP(row.totalSales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card admin-dashboard-panel admin-top-consultants">
        <h3>Top-performing consultants</h3>
        <RankedList
          rows={report.topConsultants.map((row) => ({
            id: row.consultantId,
            name: row.consultantName,
            value: formatPHP(row.totalSales),
          }))}
        />
      </div>
    </div>
  );
}
