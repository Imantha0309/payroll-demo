// react-bootstrap
import { ListGroup } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../Breadcrumb';

// -----------------------|| NAV LEFT ||-----------------------//

export default function NavLeft() {
  const navigate = useNavigate();

  const handleBack = (event) => {
    event.preventDefault();
    // Prefer router navigation if available; fallback to browser history
    try {
      navigate(-1);
    } catch (err) {
      window.history.back();
    }
  };

  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled">
      <li className="pc-h-item">
        <div className="d-flex align-items-center">
          <a href="#" className="pc-head-link arrow-none me-3 d-flex align-items-center" onClick={handleBack}>
            <FeatherIcon icon="chevron-left" className="me-2" />
            Back
          </a>
          <div className="d-none d-md-block">
            <Breadcrumb inline={true} />
          </div>
        </div>
      </li>
    </ListGroup>
  );
}
