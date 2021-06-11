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

const templates = {
  breadcrumbs: `
    <div class="breakY" style="font-size: 1rem">
      <p>1. 🔑 Login</p>
      <p>2. 🔎 Check Inbox</p>
      <p>3. 🚀 Archive</p>
    </div>
  `,
};

function _processTemplates(buffer) {
  let str = buffer.toString();
  for (let k in templates) {
    let regx = new RegExp(`{${k}}`, 'g');
    str = str.replace(regx, templates[k]);
  }
  return str;
}

const render = (res, data) => {
  let key = Object.keys(data)[0];

  if (Object.keys(types).indexOf(key) === -1) key = 'html';

  let mimeType = types[key],
    content = data[key];

  if (content) {
    content = _processTemplates(content);
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
