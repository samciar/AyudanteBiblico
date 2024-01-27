
var routes = [
  {
    path: '/home',
    url: '/home/'
  },
  {
    path: '/topics/',
    componentUrl: './pages/topics.html'
  },
  {
    path: '/settings/',
    componentUrl: './pages/settings.html'
  },
  {
    path: '/panel-chapters/',
    content: `
      <div class="page">
        <div class="navbar">
          <div class="navbar-bg"></div>
          <div class="navbar-inner sliding">
            <div class="left">
              <a  class="link back">
                <i class="icon icon-back"></i>
                <span class="if-not-md">Back</span>
              </a>
            </div>
            <div class="title book-title">Book</div>
          </div>
        </div>
        <div class="page-content">
          <div class="block">
            <div class="block-title">Cápitulos</div>
            <div class="chapters-box">
              <div class="grid grid-cols-5 grid-min-gap">
              <!-- Dinamic load -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  },
  {
    path: '/topic/:index/',
    componentUrl: './pages/topic.html',
  },
  {
    path: '/about/',
    url: './pages/about.html',
  },
  {
    path: '/thanks/',
    url: './pages/thanks.html',
  },
  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    componentUrl: './pages/dynamic-route.html',
  },
  {
    path: '/request-and-load/user/:userId/',
    async: function ({ router, to, resolve }) {
      // App instance
      var app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      var userId = to.params.userId;

      // Simulate Ajax Request
      setTimeout(function () {
        // We got user data from request
        var user = {
          firstName: 'Vladimir',
          lastName: 'Kharlampidi',
          about: 'Hello, i am creator of Framework7! Hope you like it!',
          links: [
            {
              title: 'Framework7 Website',
              url: 'http://framework7.io',
            },
            {
              title: 'Framework7 Forum',
              url: 'http://forum.framework7.io',
            },
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            componentUrl: './pages/request-and-load.html',
          },
          {
            props: {
              user: user,
            }
          }
        );
      }, 1000);
    },
  },
  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
