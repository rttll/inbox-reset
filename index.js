const http = require('http');
const fs = require('fs');
// var enableDestroy = require('server-destroy');

const routes = {
  '/': './public/index.html',
};

const get = (url) => {
  let page = routes[url];
  return fs.readFileSync(page, function (err, html) {
    return html;
  });
};

const handler = function (req, res) {
  res.writeHeader(200, { 'Content-Type': 'text/html' });
  // res.writeHead(200);
  let html = get(req.url);
  res.write(html);
  res.end();
};

const server = http.createServer(handler);
const port = 8080;
console.log('listening on port ' + port);

server.listen(port);
