// Menu configuration for default layout
import { performLogout } from 'utils/auth';

const menuItems = {
  items: [
    {
      id: 'main',
      type: 'group',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'home',
          url: '/dashboard'
        },
        {
          id: 'employees',
          title: 'Employees',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'group',
          url: '/employees'
        },
        {
          id: 'sample 1',
          title: 'Sample 1',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'group',
          url: '/sample 1'
        },
        {
          id: 'sample 2',
          title: 'Sample 2',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'group',
          url: '/sample 2'
        },
        {
          id: 'sample 3',
          title: 'Sample 3',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'assignment',
          children: [
            {
              id: 'sample 3.1',
              title: 'Sample 3.1',
              type: 'item',
              iconname: 'list',
              url: '/sample 3.1'
            },
            {
              id: 'sample 3.2',
              title: 'Sample 3.2',
              type: 'item',
              iconname: 'list',
              url: '/sample 3.2'
            }
          ]
        },
        {
          id: 'sample4',
          title: 'Sample 4',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'business',
          url: '/sample 4'
        },
        {
          id: 'sample5',
          title: 'Sample 5',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'settings',
          children: [
            {
              id: 'sample 5.1',
              title: 'Sample 5.1',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'design_services',
              url: '/sample 5.1'
            },
            {
              id: 'sample 5.2',
              title: 'Sample 5.2',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'military_tech',
              url: '/sample 5.2'
            },
            {
              id: 'sample 5.3',
              title: 'Sample 5.3',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'payments',
              url: '/sample 5.3'
            }
          ]
        },
        {
          id: 'security',
          title: 'Security',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'security',
          children: [
            {
              id: 'users',
              title: 'Users',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'people',
              url: '/security/users'
            },
            {
              id: 'login-sessions',
              title: 'Login Sessions',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'schedule',
              url: '/security/login-sessions'
            },
            {
              id: 'roles',
              title: 'Roles',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'admin_panel_settings',
              url: '/security/roles'
            },
            {
              id: 'permissions',
              title: 'Permissions',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'vpn_key',
              url: '/security/permissions'
            },
            {
              id: 'role-permissions',
              title: 'Role Permissions',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'rule',
              url: '/security/role-permissions'
            },

            // admin logs
            {
              id: 'admin-logs',
              title: 'Admin Logs',
              type: 'item',
              url: '/security/admin-logs',
              icon: 'material-icons-two-tone',
              iconname: 'history'
            }


          ]
        },
        {
          id: 'logout',
          title: 'Log Out',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'exit_to_app',
          linkClassName: 'logout-link',
          action: performLogout
        }
      ]
    }
  ]
};

export default menuItems;