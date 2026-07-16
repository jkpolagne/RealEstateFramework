import { useEffect, useState } from 'react';
import type { Developer, Property, PropertyStatus, PropertyType } from '../../types';
import { getAllPropertiesForAdmin, deleteProperty } from '../../services/propertyService';
import { getAllDevelopers } from '../../services/developerService';
import { PropertyForm } from '../../components/company-admin/PropertyForm';
import { StatusBadge } from '../../components/property-seeker/StatusBadge';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { formatPHP } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';

type TypeFilter = 'all' | PropertyType;
type StatusFilter = 'all' | PropertyStatus;

export function ManagePropertiesPage() {
  const { session } = useAuth();
  const companyId = session!.companyId!;
  const [properties, setProperties] = useState<Property[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [developerFilter, setDeveloperFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    Promise.all([getAllPropertiesForAdmin(companyId), getAllDevelopers(companyId)]).then(([propertyResult, developerResult]) => {
      setProperties(propertyResult);
      setDevelopers(developerResult);
      setLoading(false);
    });
  }

  useEffect(refresh, [companyId]);

  async function handleDelete() {
    if (!deletingProperty) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProperty(deletingProperty.id);
      setDeletingProperty(null);
      refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setDeleting(false);
    }
  }

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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-muted admin-table-empty">
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
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingProperty(property)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setDeletingProperty(property);
                            setDeleteError(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && <PropertyForm onClose={() => setShowAddForm(false)} onSaved={refresh} />}
      {editingProperty && (
        <PropertyForm property={editingProperty} onClose={() => setEditingProperty(null)} onSaved={refresh} />
      )}
      {deletingProperty && (
        <ConfirmDialog
          title="Delete Property"
          message={`Are you sure you want to delete "${deletingProperty.name}"? This cannot be undone.`}
          confirming={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => setDeletingProperty(null)}
        />
      )}
    </div>
  );
}
