'use strict';

const http = require('http');
const url = require('url');
const api = require('./src/api');
const { getFile, render } = require('./src/util');

const routes = {
  '/': 'index',
  '/index.html': 'index',
  '/messages': 'messages',
  '/authenticate': 'authenticate', // post
  '/archive': 'archive', // post
};

const controller = {
  assets: (res, pathname) => {
    let type = pathname.split('.').slice(-1)[0],
      path;

    if (/favicon\.png/.test(pathname)) {
      path = `.${pathname}`;
    } else {
      path = `./public/${pathname}`;
    }

    let asset = getFile(path);
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
  archive: async (res) => {
    let archive = await api.archive();
    let json = JSON.stringify(archive);
    render(res, { json });
  },
};

const handler = function (req, res) {
  const { pathname, query } = url.parse(req.url);

  if (/acme-challenge/.test(req.url)) {
    res.writeHeader(200, { 'Content-Type': 'text/html' });
    res.write(
      'hxiP5EA1R-A7sQzZ42UYp33fMif-AhNtSgX8jdjNQKg.Cw29Ra92SnlCcSqWsy7C9snNDMf_9IEutdGaOxlO23k'
    );
    res.end();
    return;
  }

  const assets = /\.js$|\.css$|\.png$/.test(pathname);
  if (assets) {
    return controller.assets(res, pathname);
  }

  const route = routes[pathname];
  let method = controller[route];

  // html catch-all and 404
  if (typeof method !== 'function') {
    let ext = pathname.split('.').slice(-1)[0],
      data = null;
    if (ext === 'html') {
      data = getFile(`./public/${pathname}`);
    }
    render(res, { [ext]: data });
    return;
  }

  method(res, query);
};

const server = http.createServer(handler);
const port = process.env.PORT || 8080;
console.log('listening on port ' + port);

server.listen(port);
