import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword({ show, handleClose }) {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(
        `${API_URL}/users/reset-password`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setFormData({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
        
        // Close modal after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      old_password: '',
      new_password: '',
      confirm_password: ''
    });
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered size="md">
      <Modal.Header closeButton className="border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
        <Modal.Title className="d-flex align-items-center">
          <FeatherIcon icon="lock" size={20} className="me-2" style={{ color: '#009448' }} />
          <span>Change Password</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {successMessage && (
          <Alert variant="success" dismissible onClose={() => setSuccessMessage('')} className="d-flex align-items-center">
            <FeatherIcon icon="check-circle" size={18} className="me-2" />
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="danger" dismissible onClose={() => setErrorMessage('')} className="d-flex align-items-center">
            <FeatherIcon icon="alert-circle" size={18} className="me-2" />
            {errorMessage}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Current Password */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold" style={{ color: '#333' }}>
              Current Password
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPasswords.old ? 'text' : 'password'}
                name="old_password"
                placeholder="Enter your current password"
                value={formData.old_password}
                onChange={handleChange}
                isInvalid={!!errors.old_password}
                disabled={isLoading}
                className="border-end-0"
                style={{
                  borderColor: errors.old_password ? '#dc3545' : '#e0e0e0'
                }}
              />
              <Button
                variant="outline-secondary"
                onClick={() => togglePasswordVisibility('old')}
                disabled={isLoading}
                className="border-start-0"
                style={{
                  borderColor: errors.old_password ? '#dc3545' : '#e0e0e0',
                  backgroundColor: '#fff'
                }}
              >
                <FeatherIcon icon={showPasswords.old ? 'eye-off' : 'eye'} size={18} />
              </Button>
              {errors.old_password && (
                <Form.Control.Feedback type="invalid" className="d-block">
                  {errors.old_password[0]}
                </Form.Control.Feedback>
              )}
            </div>
          </Form.Group>

          {/* New Password */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold" style={{ color: '#333' }}>
              New Password
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPasswords.new ? 'text' : 'password'}
                name="new_password"
                placeholder="Enter your new password"
                value={formData.new_password}
                onChange={handleChange}
                isInvalid={!!errors.new_password}
                disabled={isLoading}
                className="border-end-0"
                style={{
                  borderColor: errors.new_password ? '#dc3545' : '#e0e0e0'
                }}
              />
              <Button
                variant="outline-secondary"
                onClick={() => togglePasswordVisibility('new')}
                disabled={isLoading}
                className="border-start-0"
                style={{
                  borderColor: errors.new_password ? '#dc3545' : '#e0e0e0',
                  backgroundColor: '#fff'
                }}
              >
                <FeatherIcon icon={showPasswords.new ? 'eye-off' : 'eye'} size={18} />
              </Button>
              {errors.new_password && (
                <Form.Control.Feedback type="invalid" className="d-block">
                  {errors.new_password[0]}
                </Form.Control.Feedback>
              )}
            </div>
            <small className="text-muted d-block mt-2">
              <FeatherIcon icon="info" size={14} className="me-1" style={{ verticalAlign: 'middle' }} />
              Password must contain: uppercase, lowercase, and number (min 6 characters)
            </small>
          </Form.Group>

          {/* Confirm Password */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold" style={{ color: '#333' }}>
              Confirm Password
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirm_password"
                placeholder="Confirm your new password"
                value={formData.confirm_password}
                onChange={handleChange}
                isInvalid={!!errors.confirm_password}
                disabled={isLoading}
                className="border-end-0"
                style={{
                  borderColor: errors.confirm_password ? '#dc3545' : '#e0e0e0'
                }}
              />
              <Button
                variant="outline-secondary"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={isLoading}
                className="border-start-0"
                style={{
                  borderColor: errors.confirm_password ? '#dc3545' : '#e0e0e0',
                  backgroundColor: '#fff'
                }}
              >
                <FeatherIcon icon={showPasswords.confirm ? 'eye-off' : 'eye'} size={18} />
              </Button>
              {errors.confirm_password && (
                <Form.Control.Feedback type="invalid" className="d-block">
                  {errors.confirm_password[0]}
                </Form.Control.Feedback>
              )}
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-top" style={{ backgroundColor: '#f8f9fa', padding: '1.25rem' }}>
        <Button
          variant="light"
          onClick={handleModalClose}
          disabled={isLoading}
          style={{
            borderColor: '#e0e0e0',
            color: '#333',
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            backgroundColor: '#009448',
            borderColor: '#009448'
          }}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Updating...
            </>
          ) : (
            <>
              <FeatherIcon icon="save" size={16} className="me-2" />
              Update Password
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
