var zipFolder = require('zip-folder');
var path = require('path');

const srcDir = path.join(__dirname, "../build-chrome")
const destPath = path.join(__dirname, "../build-chrome.zip")
console.log('About to create zipfile: ' + destPath);
zipFolder(srcDir, destPath, function(err) {
  if (err) {
    console.log('Could not write export zip!', err);
  } else {
    console.log('Successfully created zipfile: ' + destPath);
  }
});