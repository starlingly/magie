const fs = require('fs');
const path = require('path');

function assertContains(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    throw new Error(`Missing ${label}: expected to find "${needle}"`);
  }
}

(function run() {
  const indexPath = path.join(__dirname, '..', 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  assertContains(html, 'link rel="stylesheet" href="style.css"', 'stylesheet link');
  assertContains(html, 'script src="app.js"', 'application script reference');
  assertContains(html, 'id="cloud-status"', 'cloud status banner');

  const stylePath = path.join(__dirname, '..', 'style.css');
  const css = fs.readFileSync(stylePath, 'utf8');
  assertContains(css, '.status-banner', 'cloud status styles');

  const appPath = path.join(__dirname, '..', 'app.js');
  const appJs = fs.readFileSync(appPath, 'utf8');
  assertContains(appJs, 'setCloudStatus', 'cloud status helper');
  assertContains(appJs, 'config.js', 'config documentation mention');

  console.log('Smoke checks passed.');
})();
