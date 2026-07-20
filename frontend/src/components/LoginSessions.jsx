import { useState, useEffect } from "react";
import MainCard from "components/Card/MainCard";
import { Table, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import Pagination from "./Pagination";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [submitError, setSubmitError] = useState(null);

  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  };

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
        headers: getAuthHeaders(),
      });

      const permissions = res.data.permissions || [];
      setUserPermissions(permissions);
      localStorage.setItem("userPermissions", JSON.stringify(permissions));
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
      }
    } finally {
      setPermissionsLoaded(true);
    }
  };

  const fetchLoginSessions = (page = 1, search = null) => {

    var searchTxt = search ? search : '';
    if (!hasPermission("Security_read_all")) return;

    setLoading(true);
    setSubmitError(null);

    axios
      .get(`${API_URL}/login-sessions?page=${page}${searchTxt ? `&search=${searchTxt}` : ''}`, {
        params: {
          per_page: 10,
        },
        headers: getAuthHeaders(),
      })
      .then((res) => {
        setSessions(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setTotalPages(res.data.last_page || 1);
          setTotalCount(res.data.total || 0);
      })
      .catch((err) => {
        console.error(err);
        setSubmitError("Failed to fetch login sessions. Please try again.");

        if (err.response?.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userRole");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      })
      .finally(() => setLoading(false));
  };

  // Load permissions
  useEffect(() => {
    fetchUserPermissions();
  }, []);

  // ✅ FIXED: proper search handling
  useEffect(() => {
    if (!permissionsLoaded || !hasPermission("Security_read_all")) return;

    const trimmed = search.trim();

    // only search if empty OR >= 3 chars
    if (trimmed === "" || trimmed.length >= 3) {
      fetchLoginSessions(1, trimmed);
    }
  }, [permissionsLoaded, search]);

  const handleSearchChange = (value) => {
    setCurrentPage(1);
    setSearch(value);
  };

  if (!permissionsLoaded) {
    return (
      <MainCard title="Login Sessions">
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" />
          <p className="mt-3">Loading permissions...</p>
        </div>
      </MainCard>
    );
  }

  if (!hasPermission("Security_read_all")) {
    return (
      <MainCard title="Login Sessions">
        <Alert variant="danger" className="text-center py-4">
          <h4>Access Denied</h4>
          <p>You don't have permission to view login sessions.</p>
        </Alert>
      </MainCard>
    );
  }

  return (
    <MainCard cardClass="mt-0.9" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h4 className="mb-0" style={{ fontSize: "1.25rem", fontWeight: "600" }}>
          Login Sessions
        </h4>

       <div style={{ position: 'relative', flex: '0 1 350px', minWidth: '200px' }}>
              <Form.Control
                type="text"
                placeholder="Search: Min 3 characters"
                value={search || ''}
                onChange={(e) => {
                  handleSearchChange(e.target.value);
                }}
                style={{
                  paddingLeft: '40px',
                  backgroundColor: '#f5f5f5',
                  border: 'none',
                  borderRadius: '0.5rem',
                  height: '42px',
                  fontSize: '0.9rem'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                pointerEvents: 'none'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.442 1.398a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                </svg>
              </span>
            </div>
      </div>

      <hr />

      {submitError && <Alert variant="danger">{submitError}</Alert>}

      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead style={{ backgroundColor: "#f8f9fa" }}>
            <tr>
              <th>#</th>
              <th>User Name</th>
              <th>Organization</th>
              <th>Login Time</th>
              <th>Logout Time</th>
              <th>IP Address</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  <Spinner animation="border" size="sm" />
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No login sessions found
                </td>
              </tr>
            ) : (
              sessions.map((session, index) => (
                <tr key={session.id}>
                  <td>{(currentPage - 1) * 10 + index + 1}</td>
                  <td>{session.user_name}</td>
                  <td>{session.organization_name}</td>
                  <td>{session.login_time}</td>
                  <td>{session.logout_time || "-"}</td>
                  <td>{session.ip_address || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
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