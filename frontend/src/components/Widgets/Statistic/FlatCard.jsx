import PropTypes from 'prop-types';
// react-bootstrap
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// -----------------------|| FLAT CARD ||-----------------------//

export default function FlatCard({ params }) {
  let iconClass = ['material-icons-two-tone'];
  if (params.icon && params.iconClass) {
    iconClass = [...iconClass, params.iconClass];
  }

  return (
    // use auto-width for the icon column and reduce horizontal gap (gx-0)
    <Row className="align-items-center gx-0" style={{ minHeight: '64px' }}>
      <Col
        xs="auto"
        className="pe-0"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 56 }}
      >
        {params.onClick ? (
          <button
            type="button"
            onClick={params.onClick}
            className="btn p-0"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            aria-label={params.title}
          >
            <i
              className={iconClass.join(' ')}
              aria-hidden
              style={{ lineHeight: 1, margin: 0, marginRight: 8, fontSize: '1.6rem', display: 'inline-block' }}
            >
              {params.icon}
            </i>
          </button>
        ) : params.to ? (
          <Link to={params.to} className="p-0" style={{ display: 'inline-flex', alignItems: 'center' }} aria-label={params.title}>
            <i
              className={iconClass.join(' ')}
              aria-hidden
              style={{ lineHeight: 1, margin: 0, marginRight: 8, fontSize: '1.6rem', display: 'inline-block' }}
            >
              {params.icon}
            </i>
          </Link>
        ) : (
          <i
            className={iconClass.join(' ')}
            aria-hidden
            style={{ lineHeight: 1, margin: 0, marginRight: 8, fontSize: '1.6rem', display: 'inline-block' }}
          >
            {params.icon}
          </i>
        )}
      </Col>
      <Col className="text-md-center ps-0">
        <h5 className="mb-0" style={{ fontSize: '1.35rem', fontWeight: 600 }}>{params.value}</h5>
        <span style={{ fontSize: '0.78rem', color: '#6c757d', display: 'block', marginTop: 4 }}>{params.title}</span>
      </Col>
    </Row>
  );
}

FlatCard.propTypes = { 
  params: PropTypes.shape({
    icon: PropTypes.string,
    iconClass: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string
    ,onClick: PropTypes.func,
    to: PropTypes.string
  }).isRequired
};