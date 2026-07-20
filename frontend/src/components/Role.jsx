import { useState, useEffect } from 'react';
import MainCard from 'components/Card/MainCard';
import { Table, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import Pagination from './Pagination';

const API_URL = import.meta.env.VITE_API_URL;

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // permissions
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  const api = axios.create({
    baseURL: `${API_URL}`,
    headers: { 'Content-Type': 'application/json' }
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // check permission
  const hasPermission = (permissionName) => {
    const stored = localStorage.getItem("userPermissions");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.includes(permissionName)) {
          return true;
        }
      } catch (e) {}
    }
    return userPermissions.includes(permissionName);
  };

  // fetch permissions
  const fetchUserPermissions = async () => {
    try {
      const stored = localStorage.getItem("userPermissions");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setUserPermissions(parsed);
          setPermissionsLoaded(true);
          return;
        }
      }

      const res = await axios.get(`${API_URL}/user/permissions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          Accept: "application/json",
        }
      });

      const permissions = res.data.permissions || [];
      setUserPermissions(permissions);
      localStorage.setItem("userPermissions", JSON.stringify(permissions));
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
      }
    } finally {
      setPermissionsLoaded(true);
    }
  };

  const fetchRoles = (page = 1) => {
    if (!hasPermission("Security_read_all")) return;

    setLoading(true);

    api.get(`/roles?page=${page}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setRoles(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setRoles(res.data.data);
          setTotalPages(res.data.last_page || 1);
          setTotalCount(res.data.total || 0);
          setCurrentPage(res.data.current_page || 1);
        } else {
          setRoles([]);
        }
      })
      .catch((err) => {
        setError('Failed to fetch roles');
        if (err.response?.status === 401) {
          localStorage.clear();
          window.location.href = "/login";
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  useEffect(() => {
    if (permissionsLoaded && hasPermission("Security_read_all")) {
      fetchRoles(currentPage);
    }
  }, [permissionsLoaded, currentPage]);

  const formatRoleName = (name) =>
    name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // loading permissions
  if (!permissionsLoaded) {
    return (
      <MainCard title="Roles">
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" />
          <p className="mt-3">Loading permissions...</p>
        </div>
      </MainCard>
    );
  }

  // access denied
  if (!hasPermission("Security_read_all")) {
    return (
      <MainCard title="Roles">
        <Alert variant="danger" className="text-center py-4">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You don't have permission to view roles.</p>
          <p className="mb-0">Please contact your administrator for access.</p>
        </Alert>
      </MainCard>
    );
  }

  return (
    <MainCard title="Roles">
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      <div className="mb-4">
        <h5 className="mb-0" style={{ fontSize: '1.25rem', fontWeight: '600' }}>
          Roles
        </h5>
      </div>

      <hr className="mt-4" style={{ opacity: 0.15 }} />

      {/* Desktop Table View - Hidden on mobile */}
      <div className="mt-4 d-none d-lg-block" style={{
        borderRadius: '0.1rem',
        overflow: 'hidden'
      }}>
        <div className="table-responsive">
          <Table hover className="mb-0" style={{ borderCollapse: 'collapse', borderColor: '#f0f0f0' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <tr>
                <th className="py-3">ID</th>
                <th className="py-3">Name</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="2" className="text-center py-4">Loading...</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan="2" className="text-center py-4">No roles found</td></tr>
              ) : (
                roles.map((role) => (
                  <tr
                    key={role.id}
                    style={{ borderBottom: '1px solid #f0f0f0' }}
                  >
                    <td className="py-2">{role.id}</td>
                    <td className="py-2">{formatRoleName(role.name)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="mt-4 d-lg-none">
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" /> Loading...
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-4">No roles found</div>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="card mb-3" style={{
              borderRadius: '0.1rem',
              border: '1px solid #dee2e6',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-secondary me-2" style={{ fontSize: '0.75rem' }}>ID: {role.id}</span>
                    </div>
                    <h6 className="mb-0 fw-bold">{formatRoleName(role.name)}</h6>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4  w-100">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
         totalItems={totalCount} />
      </div>
    </MainCard>
  );
}