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
    case 'css':
      type = 'text/css';
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
        content = getFile('./public/404.html');
      }
      break;
  }
  res.writeHeader(200, { 'Content-Type': type });
  res.write(content);
  res.end();
};

exports.getFile = getFile;
exports.render = render;
