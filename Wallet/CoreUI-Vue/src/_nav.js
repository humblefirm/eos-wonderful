export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-wallet',
      badge: {
        variant: 'primary',
        text: 'NEW'
      }
    },
    {
      name: 'Connect',
      url: '/connect',
      icon: 'icon-star',
      children: [
        {
          name: 'Login',
          url: '/connect/login',
          icon: 'icon-star'
        },
        {
          name: 'Register',
          url: '/connect/register',
          icon: 'icon-star'
        },
        {
          name: 'EosLogin',
          url: '/connect/EosLogin',
          icon: 'icon-star'
        }
      ]
    },
    {
      name: 'Transfer Token',
      url: '/transfer',
      icon: 'icon-paper-plane'
    }
  ]
}
