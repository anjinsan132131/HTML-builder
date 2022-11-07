const fs = require('fs');
const fsProm = require('fs/promises');
const path = require('path');
const pathTemplate = path.join(__dirname + '/template.html');
const pathComponents = path.join(__dirname + '/components');
const pathDist = path.join(__dirname + '/project-dist')
const pathNewIndex = path.join(__dirname + '/project-dist/index.html')
const pathStyles = path.join(__dirname + '/styles');
const pathAllStyles = path.join(__dirname + '/project-dist/style.css');
const pathNewAssets = path.join(__dirname + '/project-dist/assets');
const pathOldAssets = path.join(__dirname + '/assets');

const ENOENT_CODE = 'ENOENT';

const readTemplate = async (file) => {
  let fileContent = await fsProm.readFile(pathTemplate, { encoding: 'utf8' });
  let start;
  for (let i = 0; i < fileContent.length - 1; i += 1) {
    if (fileContent[i] && fileContent[i + 1] === '{') {
      start = i;
    } else if (fileContent[i] && fileContent[i + 1] === '}') {
      let end = i + 2;
      length = end - start;

      for (let element in file) {
        if (fileContent.slice(start, end) === element) {
          fileContent = fileContent.substring(0, start) + file[element] + fileContent.substring(end, fileContent.length);
        }
      }
    }
  }
  return fileContent;
};

const findAllComponents = async () => {
  let componentObject = {};
  const components = await fsProm.readdir(pathComponents);
  for (let item of components) {
    const st = await fsProm.stat(`${pathComponents}/${item}`);
    if (st.isFile() && path.extname(item) === '.html') {
      let key = path.basename(item, path.extname(item));
      componentObject[`{${key}}`] = await readFile(item);
    }
  }
  return componentObject;
}

const readFile = async (file) => {
  const fileContent = await fsProm.readFile(`${pathComponents}/${file}`, { encoding: 'utf8' });
  return fileContent;
}

const makeHTML = async () => {
  const objectAllComp = await findAllComponents();
  const fullTemplate = await readTemplate(objectAllComp);
  await fsProm.mkdir(pathDist, { recursive: true });
  fsProm.access(pathNewIndex)
    .then(async () => {
      await fsProm.unlink(pathNewIndex);
      await fsProm.appendFile(pathNewIndex, `${fullTemplate}\n`);
    })
    .catch(async () => {
      await fsProm.appendFile(pathNewIndex, `${fullTemplate}\n`);
    })
}

let styleArray = [];

const readDirectory = async () => {
  const files = await fsProm.readdir(pathStyles);
  for (let item of files) {
    const style = await fsProm.stat(`${pathStyles}/${item}`)
    if (style.isFile() && path.extname(item) === '.css') {
      await readStyleFile(item);
    }
  }
};

const readStyleFile = async (file) => {
  const fileContent = await fsProm.readFile(`${pathStyles}/${file}`, { encoding: 'utf8' });
  styleArray.push(fileContent);
  return fileContent;
};

const writeFile = async (style) => {
  await fsProm.appendFile(pathAllStyles, `${style}\n`);
};

const getAllStyles = async () => {
  await readDirectory();
  fsProm.access(pathAllStyles)
    .then(async () => {
      await fsProm.unlink(pathAllStyles);
      for (let style of styleArray) {
        await writeFile(style);
      }
    })
    .catch(async () => {
      for (let style of styleArray) {
        await writeFile(style);
      }
    });
};

const getStyles = async () => {
  await makeHTML();
  await getAllStyles();
};

getStyles();

const copyDirectory = async (pathOld, pathNew) => {
  const files = await fsProm.readdir(pathOld);
  for (let item of files) {
    const st = await fsProm.stat(`${pathOld}/${item}`)
    if (st.isFile()) {
      await fsProm.copyFile(`${pathOld}/${item}`, `${pathNew}/${item}`)
    } else if (st.isDirectory()) {
      await fsProm.mkdir(`${pathNew}/${item}`, { recursive: true });
      copyDirectory(`${pathOldAssets}/${item}`, `${pathNewAssets}/${item}`)
    }
  }
};

const deleteDirectory = async (pathNew) => {
  await fsProm.rm(pathNew, { recursive: true, force: true });
  fsProm.mkdir(pathNew, { recursive: true });
};

fs.access(pathNewAssets, async (error) => {
  (error && error.code === ENOENT_CODE)
    ? (await fsProm.mkdir(pathNewAssets, { recursive: true }), copyDirectory(pathOldAssets, pathNewAssets))
    : (await deleteDirectory(pathNewAssets), copyDirectory(pathOldAssets, pathNewAssets));
});
