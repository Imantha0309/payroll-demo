import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Row, Col, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// assets
import logoDark from 'assets/images/logo-dark.png';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmation: false
  });

 const professionalStyles = `
    .auth-wrapper {
      transition: none;
      overflow: hidden;
    }
    .auth-wrapper::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(0, 148, 72, 0.08) 1.5px, transparent 1.5px);
      background-size: 24px 24px;
      z-index: 1;
      pointer-events: none;
    }
    .auth-content {
      position: relative;
      z-index: 10;
      width: 100%;
      padding: 15px;
    }
    
    /* Input customizations */

    .input-group-text {
      border-radius: 8px 0 0 8px !important;
      border-color: #cbd5e1 !important;
    }
    .btn-outline-secondary {
      border-radius: 0 8px 8px 0 !important;
      border-color: #cbd5e1 !important;
    }
  `;

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setErrorMessage('Invalid reset link. Please request a new password reset.');
        setIsValidating(false);
        return;
      }

      try {
        const response = await axios.post(`${API_URL}/password/validate-token`, {
          token: token,
          email: email
        });

        if (response.data.valid) {
          setIsValidToken(true);
        } else {
          setErrorMessage(response.data.message || 'Invalid or expired reset link.');
        }
      } catch (error) {
        if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage('Invalid or expired reset link.');
        }
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.password) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (!formData.password_confirmation) {
      setErrorMessage('Please confirm your password.');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/password/reset`, {
        email: email,
        token: token,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        setErrorMessage(firstError);
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{professionalStyles}</style>
      <div
        className="auth-wrapper"
        style={{
          background: "linear-gradient(135deg, #009448 0%, #007a3b 100%)",
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="auth-content text-center">
          <Card
            className="borderless professional-card"
            style={{
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(0, 50, 20, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)",
              maxWidth: "400px",
              margin: "0 auto",
              overflow: "hidden"
            }}
          >
            <Row className="align-items-center text-center">
              <Col>
                <Card.Body
                  className="card-body"
                  style={{
                    padding: "2rem 2rem",
                    background: "transparent",
                  }}
                >
                  <img
                    src={logoDark}
                    alt="Government Logo"
                    className="img-fluid mb-3"
                    style={{
                      maxHeight: "80px",
                      width: "auto"
                    }}
                  />
                  <h4
                    className="mb-2"
                    style={{
                      color: "#16894eff",
                      fontWeight: "700",
                      fontSize: "1.6rem"
                    }}
                  >
                    Reset Password
                  </h4>
                  <p
                    className="text-muted mb-4"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Enter your new password below.
                  </p>

                  {isValidating ? (
                    <div className="text-center py-4">
                      <span className="spinner-border text-success" role="status"></span>
                      <p className="mt-3 text-muted">Validating reset link...</p>
                    </div>
                  ) : (
                    <>
                      {successMessage && (
                        <Alert 
                          variant="success" 
                          className="mb-3 text-start"
                          style={{
                            backgroundColor: "#d4edda",
                            borderColor: "#c3e6cb",
                            color: "#155724",
                            fontSize: "0.9rem",
                            border: "1px solid #c3e6cb",
                            borderRadius: "6px"
                          }}
                        >
                          <FeatherIcon icon="check-circle" size={16} className="me-2" style={{ verticalAlign: "middle" }} />
                          {successMessage}
                          <br />
                          <small className="ms-4">Redirecting to login...</small>
                        </Alert>
                      )}

                      {errorMessage && (
                        <Alert 
                          variant="danger" 
                          className="mb-3 text-start"
                          style={{
                            backgroundColor: "#f8d7da",
                            borderColor: "#f5c6cb",
                            color: "#721c24",
                            fontSize: "0.9rem",
                            border: "1px solid #f5c6cb",
                            borderRadius: "6px"
                          }}
                        >
                          <FeatherIcon icon="alert-circle" size={16} className="me-2" style={{ verticalAlign: "middle" }} />
                          {errorMessage}
                        </Alert>
                      )}

                      {isValidToken && !successMessage ? (
                        <Form onSubmit={handleSubmit}>
                          {/* New Password */}
                          <InputGroup className="mb-3">
                            <InputGroup.Text
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                border: "1px solid #cbd5e1",
                                color: "#475569"
                              }}
                            >
                              <FeatherIcon icon="lock" size={18} />
                            </InputGroup.Text>
                            <Form.Control
                              type={showPasswords.password ? "text" : "password"}
                              name="password"
                              placeholder="Enter new password"
                              value={formData.password}
                              onChange={handleChange}
                              disabled={isLoading}
                              style={{
                                border: "1px solid #cbd5e1",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#334155",
                                fontSize: "0.95rem",
                                padding: "0.7rem"
                              }}
                            />
                            <Button
                              variant="outline-secondary"
                              onClick={() => togglePasswordVisibility("password")}
                              disabled={isLoading}
                              style={{
                                border: "1px solid #cbd5e1",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#475569"
                              }}
                            >
                              <FeatherIcon icon={showPasswords.password ? "eye-off" : "eye"} size={18} />
                            </Button>
                          </InputGroup>

                          {/* Confirm Password */}
                          <InputGroup className="mb-3">
                            <InputGroup.Text
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                border: "1px solid #cbd5e1",
                                color: "#475569"
                              }}
                            >
                              <FeatherIcon icon="lock" size={18} />
                            </InputGroup.Text>
                            <Form.Control
                              type={showPasswords.confirmation ? "text" : "password"}
                              name="password_confirmation"
                              placeholder="Confirm new password"
                              value={formData.password_confirmation}
                              onChange={handleChange}
                              disabled={isLoading}
                              style={{
                                border: "1px solid #cbd5e1",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#334155",
                                fontSize: "0.95rem",
                                padding: "0.7rem"
                              }}
                            />
                            <Button
                              variant="outline-secondary"
                              onClick={() => togglePasswordVisibility("confirmation")}
                              disabled={isLoading}
                              style={{
                                border: "1px solid #cbd5e1",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#475569"
                              }}
                            >
                              <FeatherIcon icon={showPasswords.confirmation ? "eye-off" : "eye"} size={18} />
                            </Button>
                          </InputGroup>

                          <small className="text-muted d-block mb-4" style={{ fontSize: "0.85rem", textAlign: "left" }}>
                            <FeatherIcon icon="info" size={14} className="me-1" style={{ verticalAlign: "middle" }} />
                            Password must contain: uppercase, lowercase, and number (min 6 characters)
                          </small>

                          <Button
                            type="submit"
                            className="btn btn-block mb-3"
                            disabled={isLoading}
                            style={{
                              background: "linear-gradient(135deg, #009448 0%, #007a3b 100%)",
                              border: "none",
                              color: "white",
                              fontWeight: "600",
                              padding: "0.75rem 1.25rem",
                              fontSize: "0.95rem",
                              borderRadius: "8px",
                              width: "100%",
                              boxShadow: "0 4px 12px rgba(0, 148, 72, 0.2)",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              if (!isLoading) {
                                e.currentTarget.style.background = "linear-gradient(135deg, #00a651 0%, #008c43 100%)";
                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 148, 72, 0.3)";
                                e.currentTarget.style.transform = "translateY(-1px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isLoading) {
                                e.currentTarget.style.background = "linear-gradient(135deg, #009448 0%, #007a3b 100%)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 148, 72, 0.2)";
                                e.currentTarget.style.transform = "translateY(0)";
                              }
                            }}
                          >
                            {isLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                <span>RESETTING...</span>
                              </>
                            ) : (
                              <>
                                <FeatherIcon icon="check" size={16} className="me-2" style={{ verticalAlign: "middle" }} />
                                RESET PASSWORD
                              </>
                            )}
                          </Button>
                        </Form>
                      ) : null}

                      <div className="text-center mb-3">
                        <Link
                          to="/login"
                          style={{
                            color: "#009448",
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            transition: "color 0.2s ease"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#007a3b")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#009448")}
                        >
                          <FeatherIcon icon="arrow-left" size={14} className="me-1" style={{ verticalAlign: "middle" }} />
                          Back to Login
                        </Link>
                      </div>

                      <p className="text-muted mb-2" style={{ fontSize: "0.85rem" }}>
                        © PM Office | Sri Lanka
                      </p>
                    </>
                  )}
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </>
  );
}