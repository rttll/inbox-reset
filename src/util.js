'use strict';

const fs = require('fs');
const getFile = (file) => {
  file = file.replace(/\/\//, '/');
  try {
    return fs.readFileSync(file, function (err, html) {
      if (err) {
        return getFile(`./public/404.html`);
      }
      return html;
    });
  } catch (err) {
    return getFile(`./public/404.html`);
  }
};

const types = {
  json: 'application/json',
  html: 'text/html',
  js: 'application/javascript',
  css: 'text/css',
  png: 'image/png',
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
  let key = Object.keys(data)[0],
    mimeType = types[key],
    content = data[key];

  if (!content && key !== 'html') {
    res.writeHead(404);
    res.end();
    return;
  }
  if (key === 'html') content = _processTemplates(content);

  res.writeHeader(200, { 'Content-Type': mimeType });
  res.write(content);
  res.end();
};

exports.getFile = getFile;
exports.render = render;
