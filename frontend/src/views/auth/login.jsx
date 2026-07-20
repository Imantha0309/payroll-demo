import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
const apiBaseUrl = API_URL?.replace(/\/api$/, '');
// const payrolLogo = apiBaseUrl ? `${apiBaseUrl}/images/login_logo.png` : `${window.location.origin}/images/flms_logo.png`;

// assets
import logoDark from "assets/images/logo-dark.png";

export default function SignIn1() {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Load reCAPTCHA
  useEffect(() => {
    window.recaptchaCallback = (token) => {
      console.log("reCAPTCHA token received:", token);
      setRecaptchaToken(token);
    };

    const script = document.createElement("script");
    script.src =
      "https://www.google.com/recaptcha/api.js?onload=recaptchaOnload&render=explicit";
    script.async = true;
    script.defer = true;

    window.recaptchaOnload = () => {
      console.log("reCAPTCHA script loaded");
      if (recaptchaRef.current) {
        window.grecaptcha.render(recaptchaRef.current, {
          sitekey: "6Ldt1-krAAAAAAGublqaAcDyykXmRAV1r9C0RCwe",
          callback: "recaptchaCallback",
          "expired-callback": "recaptchaExpired",
        });
      }
    };

    window.recaptchaExpired = () => {
      console.log("reCAPTCHA expired");
      setRecaptchaToken("");
    };

    document.head.appendChild(script);

    return () => {
      delete window.recaptchaCallback;
      delete window.recaptchaOnload;
      delete window.recaptchaExpired;
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

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
    .password-toggle-btn {
      border: 1px solid #dee2e6;
      background-color: #f8f9fa;
      color: #6c757d;
      transition: all 0.2s ease;
    }
    .password-toggle-btn:hover {
      color: #33b973 !important;          /* Green eye icon */
      background-color: #f8f9fa !important;
    }

    
  }
  `;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials({
      ...credentials,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const checkLogin = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Form submitted with recaptchaToken:", recaptchaToken);

    if (!credentials.email && !credentials.password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!credentials.email) {
      setError("Please enter your email.");
      return;
    }
    if (!credentials.password) {
      setError("Please enter your password.");
      return;
    }
    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA verification.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        email: credentials.email,
        password: credentials.password,
        remember: credentials.remember,
        recaptcha: recaptchaToken,
      };

      console.log("Sending payload:", payload);

      const { data } = await axios.post(`${API_URL}/login`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Login response:", data);

      const { role, token, user } = data;

      // Clear any stale permissions from a previous session before saving new ones
      localStorage.removeItem('userPermissions');

      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userRoleId", user?.role_id);
      // Save under both keys: "permissions" (legacy) and "userPermissions" (used by all components)
      localStorage.setItem("permissions", JSON.stringify(data.permissions || []));
      localStorage.setItem("userPermissions", JSON.stringify(data.permissions || []));

      if (user) {
        localStorage.setItem(
          "login_session_id",
          JSON.stringify(data.login_session_id)
        );
        localStorage.setItem("user", JSON.stringify(user));
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred during login. Please try again.");
      }

      if (window.grecaptcha) {
        window.grecaptcha.reset();
        setRecaptchaToken("");
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
          // background:"linear-gradient(135deg, #004d25 0%, #009448 45%, #00f5c0be 100%)",
          // background:"linear-gradient(135deg, #01170b 0%, #00592b 45%, #009448 100%)",
          background:"linear-gradient(135deg, #005c2d 0%, #009448 45%, #33b973 100%)",
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
              background: "rgba(255, 255, 255, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "1rem",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              maxWidth: "380px",
              margin: "0 auto",
            }}
          >
            <Row className="align-items-center text-center">
              <Col>
                <Card.Body
                  className="card-body"
                  style={{
                    padding: "1.5rem 1.5rem",
                    background: "transparent",
                  }}
                >
                  <img
                    src={logoDark}
                    alt="Government Logo"
                    className="img-fluid mb-3"
                    style={{
                      maxHeight: "80px",
                      width: "auto",
                    }}
                  />
                  <h4
                    className="mb-3"
                    style={{
                      color: "#009448",
                      fontWeight: "600",
                      fontSize: "2rem",
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <h4
                    className="mb-3"
                    style={{
                      color: "#009448",
                      fontWeight: "800",
                      fontSize: "2.5rem",
                      letterSpacing: "2px"
                    }}
                  >
                    PAYROLL
                  </h4>
                    </span>
                    <span style={{ color: "#6c757d", fontSize: "0.8rem" }}>
                      LABOUR PAYROLL MANAGEMENT SYSTEM
                    </span>
                  </h4>

                  {error && (
                    <div
                      className="alert alert-danger mb-3"
                      style={{
                        backgroundColor: "#f8d7da",
                        borderColor: "#f5c6cb",
                        color: "#721c24",
                        fontSize: "0.9rem",
                        border: "1px solid #f5c6cb",
                        borderRadius: "6px",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <Form onSubmit={checkLogin}>
                    <InputGroup className="mb-3">
                      <InputGroup.Text
                        style={{
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #dee2e6",
                          color: "#495057",
                        }}
                      >
                        <FeatherIcon icon="mail" size={18} />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={credentials.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        style={{
                          border: "1px solid #dee2e6",
                          backgroundColor: "#fff",
                          color: "#495057",
                          fontSize: "1rem",
                          padding: "0.65rem",
                        }}
                      />
                    </InputGroup>

                    <InputGroup className="mb-3">
                      <InputGroup.Text
                        style={{
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #dee2e6",
                          color: "#495057",
                        }}
                      >
                        <FeatherIcon icon="lock" size={18} />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        style={{
                          border: "1px solid #dee2e6",
                          borderLeft: "none",
                          borderRight: "none",
                          backgroundColor: "#fff",
                          color: "#495057",
                          fontSize: "1rem",
                          padding: "0.65rem",
                        }}
                      />
                      <Button
                        variant="outline-secondary"
                        className="password-toggle-btn"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading}
                        style={{
                          border: "1px solid #dee2e6",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        <FeatherIcon icon={showPassword ? "eye-off" : "eye"} size={18} />
                      </Button>
                    </InputGroup>

                    <div className="form-group mb-3">
                      <div
                        ref={recaptchaRef}
                        className="g-recaptcha"
                        style={{ margin: "8px 0" }}
                      ></div>
                    </div>

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
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          <em>SIGNING IN...</em>
                        </>
                      ) : (
                        "SIGN IN"
                      )}
                    </Button>

                    <div className="text-center mb-3">
                      <Link
                        to="/forgot-password"
                        style={{
                          color: "#01b658ff",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                          transition: "color 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#009448"}
                        onMouseLeave={(e) => e.target.style.color = "#01b658ff"}
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    <p
                      className="text-muted mb-2"
                      style={{ fontSize: "0.85rem" }}
                    >
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