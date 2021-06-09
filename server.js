const http = require('http');
const fs = require('fs');
const url = require('url');
const auth = require('./src/auth');

require('dotenv').config();

const authCB = '/' + process.env.REDIRECT_URI;

const routes = {
  '/': 'index',
  '/archiver': 'archiver',
  '/404': 'not_found',
  [authCB]: authCB,
  '/authenticate': 'authenticate', // post
};

const get = (file) => {
  return fs.readFileSync(file, function (err, html) {
    if (err) {
      return false;
    }
    return html;
  });
};

const render = (res, data) => {
  const key = Object.keys(data)[0];
  let content = data[key],
    type;
  switch (key) {
    case 'json':
      type = 'application/json';
      break;
    case 'js':
      type = 'application/javascript';
      if (!content) {
        res.writeHead(400);
        res.end();
        return;
      }
      break;
    default:
      // html
      type = 'text/html';
      if (!content) {
        content = get('./public/404.html');
      }
      break;
  }
  res.writeHeader(200, { 'Content-Type': type });
  res.write(content);
  res.end();
};

const controller = {
  assets: (res, pathname) => {
    let asset = get(`./public/assets${pathname}`);
    let type = pathname.split('.').pop();
    render(res, { [type]: asset });
  },
  index: (res, query) => {
    let file = './public/index.html';
    let html = get(file);
    render(res, { html: html });
  },
  not_found: (res) => {
    let file = './public/404.html';
    let html = get(file);
    render(res, { html });
  },
  authenticate: (res) => {
    let url = auth.authenticate();
    let json = JSON.stringify(url);
    render(res, { json });
  },
  [authCB]: (res, query) => {
    // /authenticated
    auth.setTokens(query);
    // controller.index(res);
    let file = './public/archiver.html';
    let html = get(file);
    render(res, { html });
  },
};

const handler = function (req, res) {
  const { pathname, query } = url.parse(req.url);

  let assets = /\.js$/.test(pathname);
  if (assets) {
    return controller.assets(res, pathname);
  }

  let fn = controller[routes[pathname]];
  fn(res, query);
};

const server = http.createServer(handler);
const port = 8080;
console.log('listening on port ' + port);

server.listen(port);
