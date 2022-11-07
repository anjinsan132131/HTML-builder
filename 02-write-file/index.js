const process = require('process');
const { stdout } = require('process');
const fs = require('fs');
const path = require('path');
const readLine = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

fs.access(path.join(__dirname, 'text.txt'), (error) => {
  error
    ? writeText(`New file created. Please, write text: \n`)
    : writeText(`File exist. Please, write text: \n`);
});

const checkExit = (text) => {
  if (text.indexOf('exit') !== -1) {
    console.log('Goodbye.');
    process.exit();
  }
};

process.on('beforeExit', () => {
  console.log('Goodbye.');
});

const writeText = (caption) => {
  stdout.write(caption);
  readLine.on('line', (text) => {
    checkExit(text);
    fs.appendFile(path.join(__dirname, 'text.txt'), text + '\n', (error) => {
      if (error) return;
    });
  });
}