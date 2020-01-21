const http = require('http');

const handler = require('serve-handler');

module.exports = async (port, targetDirectory, rewrites = []) =>
  new Promise(resolve => {
    const server = http.createServer((request, response) => {
      return handler(request, response, {
        public: targetDirectory,
        rewrites,
        headers: [
          {
            source: '**/*.*',
            headers: [
              {
                key: 'Access-Control-Allow-Origin',
                value: '*',
              },
            ],
          },
        ],
      });
    });

    server.listen(port, () => {
      resolve(() => server.close());
    });
  });
