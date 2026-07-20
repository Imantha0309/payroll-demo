import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

// react-bootstrap
import { ListGroup } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// project imports
import NavIcon from '../NavIcon';
import { ConfigContext } from 'contexts/ConfigContext';
import * as actionType from 'store/actions';
import useWindowSize from 'hooks/useWindowSize';
import LogoutConfirmModal from '../../../LogoutConfirmModal';

// -----------------------|| NAV ITEM ||-----------------------//

export default function NavItem({ item }) {
  const windowSize = useWindowSize();
  const configContext = useContext(ConfigContext);
  const { dispatch } = configContext;
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // @ts-ignore
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  let itemTitle = item.title;
  if (item.icon) {
    itemTitle = (
      <>
        <span className="pc-mtext">{item.title}</span>
        {item.type === 'collapse' && (
          <span className="pc-arrow">
            <FeatherIcon icon="chevron-right" />
          </span>
        )}
      </>
    );
  }

  let itemTarget = '';
  if (item.target) {
    itemTarget = '_blank';
  }
  let navItemClass = ['pc-item'];
  const currentIndex = document.location.pathname
    .toString()
    .split('/')
    .findIndex((id) => id === item.id);
  if (currentIndex > -1) {
    navItemClass = [...navItemClass, 'active'];
  }

  const navLinkClass = ['pc-link'];
  if (item.linkClassName) {
    navLinkClass.push(item.linkClassName);
  }

  const handleActionClick = async (event) => {
    event.preventDefault();

    if (isLoggingOut) {
      return;
    }

    if (item.id === 'logout') {
      setShowLogoutConfirm(true);
      return;
    }

    await item.action(navigate);
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);

    try {
      await item.action(navigate);
      dispatch({ type: actionType.COLLAPSE_MENU });
    } finally {
      setIsLoggingOut(false);
    }
  };

  let subContent;
  if (item.action) {
    subContent = (
      <Link
        to="#"
        className={navLinkClass.join(' ')}
        onClick={handleActionClick}
        style={{
          pointerEvents: isLoggingOut ? 'none' : 'auto',
          opacity: isLoggingOut ? 0.7 : 1
        }}
      >
        {isLoggingOut && item.id === 'logout' ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {itemTitle}
          </>
        ) : (
          <>
            <NavIcon items={item} />
            {itemTitle}
          </>
        )}
      </Link>
    );
  } else if (item.external) {
    subContent = (
      <Link to={item.url} target="_blank" rel="noopener noreferrer" className={navLinkClass.join(' ')}>
        <NavIcon items={item} />
        {itemTitle}
      </Link>
    );
  } else {
    subContent = (
      <NavLink to={item.url} className={navLinkClass.join(' ')}>
        <NavIcon items={item} />
        {itemTitle}
      </NavLink>
    );
  }
  let mainContent;
  if (windowSize.width < 992) {
    mainContent = (
      <ListGroup.Item
        as="li"
        bsPrefix=" "
        className={navItemClass.join(' ')}
        onClick={() => dispatch({ type: actionType.COLLAPSE_MENU })}
      >
        {subContent}
        {item.id === 'logout' && (
          <LogoutConfirmModal
            show={showLogoutConfirm}
            onHide={() => !isLoggingOut && setShowLogoutConfirm(false)}
            onConfirm={confirmLogout}
            isConfirming={isLoggingOut}
          />
        )}
      </ListGroup.Item>
    );
  } else {
    mainContent = (
      <ListGroup.Item as="li" bsPrefix=" " className={navItemClass.join(' ')}>
        {subContent}
        {item.id === 'logout' && (
          <LogoutConfirmModal
            show={showLogoutConfirm}
            onHide={() => !isLoggingOut && setShowLogoutConfirm(false)}
            onConfirm={confirmLogout}
            isConfirming={isLoggingOut}
          />
        )}
      </ListGroup.Item>
    );
  }

  return <>{mainContent}</>;
}

NavItem.propTypes = { item: PropTypes.any };
