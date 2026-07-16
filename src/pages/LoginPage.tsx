import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth, dashboardPathForRole } from '../context/AuthContext';
import { resetAll } from '../lib/persist';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';

export function LoginPage() {
  const { session, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (session) {
    return <Navigate to={dashboardPathForRole(session.role)} replace />;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  function handleResetDemoData() {
    resetAll();
    window.location.reload();
  }

  return (
    <div className="login-page">
      <div className="card login-card">
        <div className="login-brand">
          <span className="login-brand-mark">R</span>
          <div>
            <strong>RealPortal</strong>
            <p className="text-muted">Advench Realty — Naga City, Camarines Sur</p>
          </div>
        </div>

        <h1 className="login-title">Sign in</h1>
        <p className="text-muted">Super Admin, Company Admin, Broker, Sales Manager, and Sales Person all sign in here.</p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-muted login-hint">
          First time setting this up? Super Admin: <code>superadmin@realportal.ph</code> / <code>SuperAdmin123</code> — use it
          to create a company and company admin, who can then create Broker/Sales Manager/Sales Person accounts.
        </p>

        <Link to="/" className="login-back-link">
          ← Back to public site
        </Link>

        <button
          type="button"
          className="btn btn-outline btn-sm login-reset-link"
          onClick={() => setConfirmingReset(true)}
        >
          Reset Demo Data
        </button>
      </div>

      {confirmingReset && (
        <ConfirmDialog
          title="Reset Demo Data"
          message="This wipes every company, developer, property, consultant account, client, and voucher back to a completely empty slate. This cannot be undone. Continue?"
          confirmLabel="Reset Everything"
          onConfirm={handleResetDemoData}
          onCancel={() => setConfirmingReset(false)}
        />
      )}
    </div>
  );
}
