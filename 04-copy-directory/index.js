const fs = require('fs');
const fsProm = require('fs/promises');
const path = require('path');
const pathNew = path.join(__dirname + '/files-copy');
const pathOld = path.join(__dirname + '/files');

const ENOENT_CODE = 'ENOENT';

const copyDirectory = async () => {
  const files = await fsProm.readdir(pathOld);
  for (let file of files) {
    await fsProm.copyFile(`${pathOld}/${file}`, `${pathNew}/${file}`)
  }
  console.log(`${files.length} file(s) copied succesfully`)
};

const deleteDirectory = async () => {
  await fsProm.rm(pathNew, { recursive: true, force: true });
  fsProm.mkdir(pathNew, { recursive: true });
};

fs.access(pathNew, async (error) => {
  (error && error.code === ENOENT_CODE)
    ? (await fsProm.mkdir(pathNew, { recursive: true }), copyDirectory())
    : (await deleteDirectory(), copyDirectory());
});
