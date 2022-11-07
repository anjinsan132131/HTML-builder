const fsProm = require('fs/promises');
const path = require('path');
const pathStyles = path.join(__dirname + '/styles');
const pathBundle = path.join(__dirname + '/project-dist' + '/bundle.css');
let stylesArray = [];

const readDirectory = async () => {
  const files = await fsProm.readdir(pathStyles);
  for (let file of files) {
    const style = await fsProm.stat(`${pathStyles}/${file}`)
    if (style.isFile() && path.extname(file) === '.css') {
      await readFile(file);
    }
  }
};

const readFile = async (file) => {
  const fileContent = await fsProm.readFile(`${pathStyles}/${file}`, { encoding: 'utf8' });
  stylesArray.push(fileContent);
  return fileContent;
};

const getAllStyles = async () => {
  await readDirectory();
  fsProm.access(pathBundle)
    .then(async () => {
      await fsProm.unlink(pathBundle);
      for (let style of stylesArray) {
        await writeFile(style);
      }
    })
    .catch(async () => {
      for (let style of stylesArray) {
        await writeFile(style);
      }
    });
};

const writeFile = async (style) => {
  await fsProm.appendFile(pathBundle, `${style}\n`);
};

getAllStyles();
