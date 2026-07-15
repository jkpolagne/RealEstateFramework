import { useEffect, useState } from 'react';
import type { Developer, Property, PropertyStatus, PropertyType } from '../../types';
import { getAllPropertiesForAdmin } from '../../services/propertyService';
import { getAllDevelopers } from '../../services/developerService';
import { AddPropertyForm } from '../../components/company-admin/AddPropertyForm';
import { StatusBadge } from '../../components/property-seeker/StatusBadge';
import { formatPHP } from '../../lib/format';

type TypeFilter = 'all' | PropertyType;
type StatusFilter = 'all' | PropertyStatus;

export function ManagePropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [developerFilter, setDeveloperFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  function refresh() {
    setLoading(true);
    Promise.all([getAllPropertiesForAdmin(), getAllDevelopers()]).then(([propertyResult, developerResult]) => {
      setProperties(propertyResult);
      setDevelopers(developerResult);
      setLoading(false);
    });
  }

  useEffect(refresh, []);

  const filtered = properties.filter((property) => {
    if (search && !property.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (developerFilter !== 'all' && property.developerId !== developerFilter) return false;
    if (typeFilter !== 'all' && property.type !== typeFilter) return false;
    if (statusFilter !== 'all' && property.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="admin-page-header">
        <h1>Manage Properties</h1>
        <p className="text-muted">Property listings across all developer partners.</p>
      </div>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search"
        />
        <select value={developerFilter} onChange={(e) => setDeveloperFilter(e.target.value)}>
          <option value="all">All developers</option>
          {developers.map((developer) => (
            <option key={developer.id} value={developer.id}>
              {developer.name}
            </option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}>
          <option value="all">All types</option>
          <option value="House">House</option>
          <option value="Lot">Lot</option>
          <option value="House and Lot">House and Lot</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          Add Property
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading properties...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Property</th>
                <th>Developer</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-muted admin-table-empty">
                    No properties match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((property) => (
                  <tr key={property.id}>
                    <td>
                      <img src={property.heroImage} alt={property.name} className="admin-table-thumb" />
                    </td>
                    <td className="admin-table-name">{property.name}</td>
                    <td>{property.developerName}</td>
                    <td>{property.type}</td>
                    <td>{formatPHP(property.price)}</td>
                    <td>
                      <StatusBadge status={property.status} />
                    </td>
                    <td className="text-muted">{property.location.address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && <AddPropertyForm onClose={() => setShowAddForm(false)} onAdded={refresh} />}
    </div>
  );
}
