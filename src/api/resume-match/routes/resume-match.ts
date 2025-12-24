/**
 * resume-match routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/resume-match',
      handler: 'resume-match.match',
      config: {
        auth: false,
      },
    },
  ],
};
