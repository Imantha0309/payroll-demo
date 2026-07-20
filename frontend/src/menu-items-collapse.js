// ==============================|| MENU ITEMS (COLLAPSE) ||============================== //

const menuItemsCollapse = {
  items: [
    {
      id: 'navigation',
      title: 'Navigation',
      type: 'group',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/dashboard',
          icon: 'home',
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default menuItemsCollapse;
