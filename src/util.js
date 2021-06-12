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

const types = {
  json: 'application/json',
  html: 'text/html',
  js: 'application/javascript',
  css: 'text/css',
};

function _processTemplates(buffer) {
  let str = buffer.toString(),
    tags = str.match(/{{(.*?)}}/g);

  if (!tags) return str;

  for (let tag of tags) {
    let fileName = tag.replace(/{{|}}/g, ''),
      html = getFile(`public/templates/_${fileName}.html`),
      regx = new RegExp(`${tag}`, 'g');
    str = str.replace(regx, html);
  }
  return str;
}

const render = (res, data) => {
  let key = Object.keys(data)[0];

  if (Object.keys(types).indexOf(key) === -1) key = 'html';

  let mimeType = types[key],
    content = data[key];

  if (content) {
    if (key === 'html') content = _processTemplates(content);
  } else {
    if (key !== 'html') {
      res.writeHead(404);
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
