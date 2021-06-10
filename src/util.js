'use strict';

const fs = require('fs');
const getFile = (file) => {
  return fs.readFileSync(file, function (err, html) {
    if (err) {
      return false;
    }
    return html;
  });
};

const _types = {
  json: 'application/json',
  html: 'text/html',
  js: 'application/javascript',
  css: 'text/css',
};

const render = (res, data) => {
  const key = Object.keys(data)[0];
  const mimeType = _types[key];
  let content = data[key];

  if (!content) {
    if (key !== 'html') {
      res.writeHead(400);
      res.end();
      return;
    }
    content = getFile('./public/404.html');
  }

  res.writeHeader(200, { 'Content-Type': mimeType });
  res.write(content);
  res.end();
};

exports.getFile = getFile;
exports.render = render;
