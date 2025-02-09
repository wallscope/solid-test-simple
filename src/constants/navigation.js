/**
 * Object mapping of known possible inboxes for the user
 */
export const NavigationItems = [
  {
    id: 'welcome',
    icon: '/img/icon/apps.svg',
    label: 'navBar.welcome',
    to: '/welcome'
  },
  {
    id: 'highfiver',
    icon: '/img/high5.svg',
    label: 'navBar.highfiver',
    to: '/highfiver'
  },
  {
    id: 'shexform',
    icon: '/img/high5.svg',
    label: 'navBar.shexform',
    to: '/shexform'
  }
];

export const ProfileOptions = [
  {
    label: 'navBar.logOut',
    onClick: 'logOut',
    icon: 'lock'
  }
];
