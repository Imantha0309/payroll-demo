import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';

export default function LogoutConfirmModal({ show, onHide, onConfirm, isConfirming }) {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={!isConfirming}>
      <Modal.Header closeButton={!isConfirming} className="border-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <FeatherIcon icon="alert-triangle" className="text-danger" size={20} />
          Confirm Logout
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        <p className="mb-0">Are you sure you want to log out? Your current session will end.</p>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={onHide} disabled={isConfirming}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Logging out...
            </>
          ) : (
            <>
              <FeatherIcon icon="log-out" size={16} className="me-2" />
              Yes, Log Out
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

LogoutConfirmModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  onConfirm: PropTypes.func,
  isConfirming: PropTypes.bool
};
