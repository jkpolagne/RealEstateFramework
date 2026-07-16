import { useEffect, useState } from 'react';
import type { Client, ConsultantAccount } from '../../types';
import { getConsultantAccounts } from '../../services/consultantAccountService';
import { getClients } from '../../services/clientService';
import { formatPHP } from '../../lib/format';
import { StatTile } from '../../components/shared/StatTile';
import { useConsultantSession } from '../../context/ConsultantSessionContext';

interface RankedAgent {
  id: string;
  name: string;
  role: string;
  clientCount: number;
  totalSales: number;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function TopAgentsPage() {
  const { companyId } = useConsultantSession();
  const [consultants, setConsultants] = useState<ConsultantAccount[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getConsultantAccounts(companyId), getClients(companyId)]).then(([consultantResult, clientResult]) => {
      setConsultants(consultantResult.filter((c) => c.role !== 'Broker'));
      setClients(clientResult);
      setLoading(false);
    });
  }, [companyId]);

  const ranked: RankedAgent[] = consultants
    .map((c) => {
      const isManager = c.role === 'Sales Manager';
      const myClients = clients.filter((client) => (isManager ? client.salesManagerId === c.id : client.salesPersonId === c.id));
      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        role: c.role,
        clientCount: myClients.length,
        totalSales: myClients.reduce((sum, client) => sum + client.salePrice, 0),
      };
    })
    .sort((a, b) => b.totalSales - a.totalSales);

  const combinedSales = ranked.reduce((sum, r) => sum + r.totalSales, 0);
  const topAgent = ranked[0];

  return (
    <div>
      <div className="admin-page-header">
        <h1>Top Agents</h1>
        <p className="text-muted">Recognition ranking across Sales Managers and Sales Persons — not tied to payouts.</p>
      </div>

      {loading ? (
        <p className="text-muted">Loading rankings...</p>
      ) : (
        <>
          <div className="stat-tile-row">
            <StatTile label="Ranked agents" value={String(ranked.length)} />
            <StatTile label="Top agent" value={topAgent ? topAgent.name : '—'} />
            <StatTile label="Combined team sales" value={formatPHP(combinedSales)} accent />
          </div>

          {ranked.length === 0 ? (
            <p className="text-muted">Nothing to rank yet.</p>
          ) : (
            <div className="agent-leaderboard">
              {ranked.map((agent, i) => {
                const rank = i + 1;
                const rankClass = rank === 1 ? 'agent-rank-gold' : rank === 2 ? 'agent-rank-silver' : rank === 3 ? 'agent-rank-bronze' : '';
                return (
                  <div key={agent.id} className={`card agent-leaderboard-card ${rankClass}`}>
                    <span className="agent-leaderboard-rank">{rank}</span>
                    <span className="agent-leaderboard-avatar">{initials(agent.name)}</span>
                    <span className="agent-leaderboard-info">
                      <span className="agent-leaderboard-name">{agent.name}</span>
                      <span className="text-muted agent-leaderboard-role">
                        {agent.role} — {agent.clientCount} client{agent.clientCount === 1 ? '' : 's'}
                      </span>
                    </span>
                    <span className="price price-lg agent-leaderboard-value">{formatPHP(agent.totalSales)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
