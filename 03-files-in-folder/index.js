const fsProm = require('fs/promises');
const path = require('path');
const paint = require('chalk');
const way = path.join(__dirname + '/secret-folder');

const BITE_IN_MEGABITE = 1024;
const SYMBOLS_AFTER_COMMA = 5;

const readDirectory = async () => {
  let count = 0;
  const files = await fsProm.readdir(way);
  for await (let file of files) {
    const style = await fsProm.stat(way + '/' + file)
    if (style.isFile()) {
      const pathBase = path.basename(file, path.extname(file));
      const pathExtName = (path.extname(file)).slice(1);
      const fileSize = (style.size / BITE_IN_MEGABITE).toFixed(SYMBOLS_AFTER_COMMA);
      console.log(`${pathBase} - ${pathExtName} - ${fileSize}kb`);
      count += 1;
    }
  }
  count === 0
    ? console.log('There are no files in the folder')
    : console.log(`There are ${count} files in the folder`);
};

readDirectory();
