import { useContext } from 'react';

// project imports
import NavContent from './NavContent';
import { ConfigContext } from 'contexts/ConfigContext';
import useWindowSize from 'hooks/useWindowSize';
import navigation from 'menu-items';
import navitemcollapse from 'menu-items-collapse';
import * as actionType from 'store/actions';

// -----------------------|| NAVIGATION ||-----------------------//

export default function Navigation() {
  const configContext = useContext(ConfigContext);
  const { collapseMenu, collapseLayout } = configContext.state;
  const windowSize = useWindowSize();
  const { dispatch } = configContext;

  const navToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  let navClass = 'dark-sidebar';

  const userRoleId = parseInt(localStorage.getItem('userRoleId'));
  const ROLE_ORGANIZATION_SUBJECT_OFFICER = 8;
  const ROLE_PARLIAMENT_SUBJECT_OFFICER = 9;
  const ROLE_ORGANIZATIONAL_TENANT_ADMIN = 10;
  const ROLE_PARLIAMENT_TENANT_ADMIN = 11;

  const filterNavigation = (items) => {
    if (userRoleId === ROLE_ORGANIZATION_SUBJECT_OFFICER) {
      return items.map(group => {
        if (group.type === 'group') {
          return {
            ...group,
            children: group.children.filter(item => {
              // Allow dashboard, employees (Public Officers), applications, and organizations. Disallow parliament_members.
              return ['dashboard', 'employees', 'applications', 'organizations'].includes(item.id) || item.id === 'logout';
            }).map(item => {
              if (item.id === 'applications' && item.children) {
                return {
                  ...item,
                  children: item.children.filter(child => child.id !== 'pm-applications')
                };
              }
              return item;
            })
          };
        }
        return group;
      });
    }

    if (userRoleId === ROLE_PARLIAMENT_SUBJECT_OFFICER) {
      return items.map(group => {
        if (group.type === 'group') {
          return {
            ...group,
            children: group.children.filter(item => {
              // PSO sees everything OSO sees plus parliament_members and pm-applications
              return ['dashboard', 'employees', 'parliament_members', 'applications', 'organizations'].includes(item.id) || item.id === 'logout';
            })
            // No filtering of application children - PSO sees both po-applications and pm-applications
          };
        }
        return group;
      });
    }

    // OTA (role 10): Same as OSO but also sees Security > Users only
    if (userRoleId === ROLE_ORGANIZATIONAL_TENANT_ADMIN) {
      return items.map(group => {
        if (group.type === 'group') {
          return {
            ...group,
            children: group.children.filter(item => {
              return ['dashboard', 'employees', 'applications', 'organizations', 'security'].includes(item.id) || item.id === 'logout';
            }).map(item => {
              if (item.id === 'applications' && item.children) {
                return {
                  ...item,
                  children: item.children.filter(child => child.id !== 'pm-applications')
                };
              }
              // Security: show only Users
              if (item.id === 'security' && item.children) {
                return {
                  ...item,
                  children: item.children.filter(child => child.id === 'users')
                };
              }
              return item;
            })
          };
        }
        return group;
      });
    }

    // PTA (role 11): Same as PSO but also sees Security > Users only
    if (userRoleId === ROLE_PARLIAMENT_TENANT_ADMIN) {
      return items.map(group => {
        if (group.type === 'group') {
          return {
            ...group,
            children: group.children.filter(item => {
              return ['dashboard', 'employees', 'parliament_members', 'applications', 'organizations', 'security'].includes(item.id) || item.id === 'logout';
            }).map(item => {
              // Security: show only Users
              if (item.id === 'security' && item.children) {
                return {
                  ...item,
                  children: item.children.filter(child => child.id === 'users')
                };
              }
              return item;
            })
          };
        }
        return group;
      });
    }
    
    return items;
  };

  const filteredNavigation = collapseLayout 
    ? filterNavigation(navitemcollapse.items) 
    : filterNavigation(navigation.items);

  let navContent = <NavContent navigation={filteredNavigation} />;
  navClass = [...navClass, 'pc-sidebar'];
  if (windowSize.width <= 1024 && collapseMenu) {
    navClass = [...navClass, 'mob-sidebar-active'];
  } else if (collapseMenu) {
    navClass = [...navClass, 'navbar-collapsed'];
  }

  let navBarClass = ['navbar-wrapper'];

  let mobileOverlay = <></>;
  if (windowSize.width <= 1024 && collapseMenu) {
    mobileOverlay = <div className="pc-menu-overlay" onClick={navToggleHandler} aria-hidden="true" />;
  }

  let navContentDOM = <div className={navBarClass.join(' ')}>{navContent}</div>;

  return (
    <nav className={navClass.join(' ')}>
      {navContentDOM}
      {mobileOverlay}
    </nav>
  );
}
