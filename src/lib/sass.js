const fs = require('fs');
const path = require('path');
var sass = require('node-sass');

fs.readFile(
  path.resolve(__dirname, '../assets/scss/index.scss'),
  function (err, buffer) {
    if (err) {
      console.log('err getting scss', err);
    }
    var result = sass.renderSync({
      data: buffer.toString(),
    });

    fs.writeFile(
      path.resolve(__dirname, '../../public/assets/css/index.css'),
      result.css.toString(),
      () => {
        console.log('wrote css');
      }
    );
  }
);
