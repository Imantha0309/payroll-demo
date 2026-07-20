import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ListGroup, Dropdown, Form } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import accountsManagerAvatar from 'assets/images/user/administrative-officer.png';
import superAdminAvatar from 'assets/images/user/super-admin.jpg';
import ResetPassword from 'views/security/ResetPassword';
import axios from 'axios';
import { performLogout } from 'utils/auth';
import LogoutConfirmModal from '../../LogoutConfirmModal';

const API_URL = import.meta.env.VITE_API_URL;

export default function NavRight() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [user, setUser] = useState({
    name: 'User',
    role: 'User'
  });

  // Function to get avatar based on user role
  const getRoleAvatar = (userRole) => {
    const roleAvatars = {
      'Super Admin': superAdminAvatar,
      'Accounts Manager': accountsManagerAvatar,

    };

    // Return role-specific avatar or default to super admin if role not found
    return roleAvatars[userRole] || superAdminAvatar;
  };

  // Get user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          name: `${parsedUser.full_name || ''} ${parsedUser.last_name || ''}`.trim() || 'User',
          role: userRole || 'User'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        // Still set the role even if user data parsing fails
        if (userRole) {
          setUser(prev => ({
            ...prev,
            role: userRole
          }));
        }
      }
    } else if (userRole) {
      // If no user data but role exists, update just the role
      setUser(prev => ({
        ...prev,
        role: userRole
      }));
    }

    // Set axios default headers if token exists
    const token = localStorage.getItem('authToken');
    const loginSessionId = localStorage.getItem('login_session_id');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (loginSessionId) {
        axios.defaults.headers.common['X-Login-Session-ID'] = loginSessionId;
      }
    }
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);

    try {
      await performLogout(navigate);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled">
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown>
          {/* <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0">
            <i className="material-icons-two-tone">search</i>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown drp-search">
            <Form className="px-3">
              <div className="form-group mb-0 d-flex align-items-center">
                <FeatherIcon icon="search" />
                <Form.Control type="search" className="border-0 shadow-none" placeholder="Search here. . ." />
              </div>
            </Form>
          </Dropdown.Menu> */}
        </Dropdown>
      </ListGroup.Item>

      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <div className="d-flex align-items-center" style={{ position: 'relative' }}>
          <Dropdown>
            <Dropdown.Toggle as="div" className="pc-head-link arrow-none me-3 user-name d-flex align-items-center" style={{ cursor: 'pointer' }}>
              <img src={getRoleAvatar(user.role)} alt="userimage" className="user-avatar" />
              <span>
                <span className="user-name">{user.name}</span>
                <span className="user-desc">{user.role}</span>
              </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-menu-end" style={{ minWidth: '200px' }}>
              <Dropdown.Item disabled className="text-muted small">
                <FeatherIcon icon="user" size={14} className="me-2" />
                {user.name}
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setShowResetPassword(true)} style={{ color: '#333' }}>
                <FeatherIcon icon="key" size={14} className="me-2" />
                Reset Password
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowHelp(!showHelp);
            }}
            onBlur={() => setShowHelp(false)}
            style={{
              border: '1px solid #009448',
              borderRadius: '2rem',
              width: '38px',
              height: '38px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: showHelp ? '#ffffff' : 'linear-gradient(45deg, #08b75cff, #007a3b)',
              color: showHelp ? '#009448' : '#ffffff',
              cursor: 'pointer',
              fontSize: '1.5rem',
              fontWeight: 600,
              lineHeight: 1,
              marginRight: '10px',
            }}
          >
            ?
          </button>

          {showHelp && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '8px',
                backgroundColor: '#fff',
                border: '1px solid #dee2e6',
                borderRadius: '0.25rem',
                padding: '12px 16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1050,
                minWidth: '200px',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div>Please contact</div>
              <div style={{ marginTop: '4px', fontWeight: 500 }}>Admin / System Administrator</div>
            </div>
          )}
          
          <Link 
            to="#" 
            className="btn btn-sm d-flex align-items-center"
            onClick={handleLogout}
            style={{ 
              pointerEvents: isLoggingOut ? 'none' : 'auto',
              opacity: isLoggingOut ? 0.7 : 1,
              borderRadius: '0.1rem',
              padding: '8px 12px',
              fontSize: '0.85rem',
              border: '1px solid #dc3545',
              color: '#dc3545',
              backgroundColor: 'transparent',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                e.target.style.backgroundColor = '#dc3545';
                e.target.style.color = 'white';
                e.target.style.borderColor = '#dc3545';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#dc3545';
                e.target.style.borderColor = '#dc3545';
              }
            }}
          >
            {isLoggingOut ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <em>LOGGING OUT...</em>
              </>
            ) : (
              <>
                <FeatherIcon icon="log-out" size={16} className="me-2" />
                Log Out
              </>
            )}
          </Link>

          <LogoutConfirmModal
            show={showLogoutConfirm}
            onHide={() => !isLoggingOut && setShowLogoutConfirm(false)}
            onConfirm={confirmLogout}
            isConfirming={isLoggingOut}
          />

          <ResetPassword show={showResetPassword} handleClose={() => setShowResetPassword(false)} />
        </div>
      </ListGroup.Item>
    </ListGroup>
  );
}