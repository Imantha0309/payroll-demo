import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// assets
import logoDark from 'assets/images/logo-dark.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const professionalStyles = `
    .auth-wrapper {
      transition: none;
    }
    .professional-card {
      transition: box-shadow 0.2s ease;
    }
    .professional-card:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
    }
  `;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/password/forgot`, {
        email: email
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setEmail('');
      }
    } catch (error) {
      if (error.response?.data?.message) {
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
          background:"linear-gradient(135deg, #005c2d 0%, #009448 45%, #33b973 100%)",
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="auth-content text-center">
          <Card
            className="borderless professional-card"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              maxWidth: '420px',
              margin: '0 auto'
            }}
          >
            <Row className="align-items-center text-center">
              <Col>
                <Card.Body
                  className="card-body"
                  style={{
                    padding: '1.5rem 1.5rem',
                    background: 'transparent'
                  }}
                >
                  <img
                    src={logoDark}
                    alt="Government Logo"
                    className="img-fluid mb-3"
                    style={{
                      maxHeight: '114px',
                      width: 'auto'
                    }}
                  />
                  <h4
                    className="mb-2"
                    style={{
                      color: '#009448',
                      fontWeight: '600',
                      fontSize: '1.5rem'
                    }}
                  >
                    Forgot Password?
                  </h4>
                  <p
                    className="text-muted mb-4"
                    style={{ fontSize: '0.9rem' }}
                  >
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  {successMessage && (
                    <Alert 
                      variant="success" 
                      className="mb-3"
                      style={{
                        backgroundColor: '#d4edda',
                        borderColor: '#c3e6cb',
                        color: '#155724',
                        fontSize: '0.9rem',
                        border: '1px solid #c3e6cb',
                        borderRadius: '6px'
                      }}
                    >
                      <FeatherIcon icon="check-circle" size={16} className="me-2" style={{ verticalAlign: 'middle' }} />
                      {successMessage}
                    </Alert>
                  )}

                  {errorMessage && (
                    <Alert 
                      variant="danger" 
                      className="mb-3"
                      style={{
                        backgroundColor: '#f8d7da',
                        borderColor: '#f5c6cb',
                        color: '#721c24',
                        fontSize: '0.9rem',
                        border: '1px solid #f5c6cb',
                        borderRadius: '6px'
                      }}
                    >
                      <FeatherIcon icon="alert-circle" size={16} className="me-2" style={{ verticalAlign: 'middle' }} />
                      {errorMessage}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <InputGroup className="mb-4">
                      <InputGroup.Text
                        style={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          color: '#495057'
                        }}
                      >
                        <FeatherIcon icon="mail" size={18} />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        style={{
                          border: '1px solid #dee2e6',
                          backgroundColor: '#fff',
                          color: '#495057',
                          fontSize: '1rem',
                          padding: '0.65rem'
                        }}
                      />
                    </InputGroup>

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
                        borderRadius: "0.2rem",
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
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          <em>SENDING...</em>
                        </>
                      ) : (
                        <>
                          <FeatherIcon icon="send" size={16} className="me-2" style={{ verticalAlign: 'middle' }} />
                          SEND RESET LINK
                        </>
                      )}
                    </Button>

                    <div className="text-center mb-3">
                      <Link
                        to="/login"
                        style={{
                          color: '#01b658ff',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#009448"}
                        onMouseLeave={(e) => e.target.style.color = "#01b658ff"}
                      >
                        <FeatherIcon icon="arrow-left" size={14} className="me-1" style={{ verticalAlign: 'middle' }} />
                        Back to Login
                      </Link>
                    </div>

                    <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                      © PM Office | Sri Lanka
                    </p>
                  </Form>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </>
  );
}
