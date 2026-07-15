import { useEffect, useState } from 'react';
import type { SystemLogEntry, SystemLogEventType } from '../../types';
import { getSystemLogs } from '../../services/systemLogService';

type TypeFilter = 'all' | SystemLogEventType;

const TYPE_LABELS: Record<SystemLogEventType, string> = {
  company_created: 'Company Created',
  company_status_changed: 'Status Changed',
  admin_created: 'Admin Created',
};

const TYPE_DOT_CLASS: Record<SystemLogEventType, string> = {
  company_created: 'timeline-dot-navy',
  company_status_changed: 'timeline-dot-warning',
  admin_created: 'timeline-dot-success',
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  useEffect(() => {
    getSystemLogs().then((result) => {
      setLogs(result);
      setLoading(false);
    });
  }, []);

  const filtered = typeFilter === 'all' ? logs : logs.filter((log) => log.type === typeFilter);

  return (
    <div>
      <div className="admin-page-header">
        <h1>System Logs</h1>
        <p className="text-muted">Timeline of company and admin account activity across the platform.</p>
      </div>

      <div className="admin-toolbar">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}>
          <option value="all">All events</option>
          <option value="company_created">Company Created</option>
          <option value="company_status_changed">Status Changed</option>
          <option value="admin_created">Admin Created</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Loading system logs...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">No log entries match this filter.</p>
      ) : (
        <div className="card timeline">
          {filtered.map((log) => (
            <div key={log.id} className="timeline-item">
              <span className={`timeline-dot ${TYPE_DOT_CLASS[log.type]}`} />
              <div className="timeline-content">
                <div className="timeline-content-top">
                  <span className="badge badge-neutral">{TYPE_LABELS[log.type]}</span>
                  <span className="timeline-time text-muted">{formatTimestamp(log.timestamp)}</span>
                </div>
                <p>{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
