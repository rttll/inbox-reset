const http = require('http');
const url = require('url');
const api = require('./src/api');
const { getFile, render } = require('./src/util');

require('dotenv').config();

const routes = {
  '/': 'index',
  '/messages': 'messages',
  '/404': 'not_found',
  '/authenticate': 'authenticate', // post
};

const controller = {
  assets: (res, pathname) => {
    let asset = getFile(`./public/assets${pathname}`);
    let type = pathname.split('.').pop();
    render(res, { [type]: asset });
  },
  index: async (res, query) => {
    if (/code/.test(query)) {
      await api.setTokens(query);
    }
    let file = './public/index.html';
    let html = getFile(file);
    render(res, { html: html });
  },
  not_found: (res) => {
    let file = './public/404.html';
    let html = getFile(file);
    render(res, { html });
  },
  authenticate: (res) => {
    let url = api.authenticate();
    let json = JSON.stringify(url);
    render(res, { json });
  },
  messages: async (res, query) => {
    let messages = await api.messages(query);
    let json = JSON.stringify(messages);
    render(res, { json });
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
