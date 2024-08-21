const getAppDataPath = require('appdata-path');
const path = require('path');

let dir = getAppDataPath('Beaver Architect');

let projectsDir = path.join(dir, 'projects');
let dataPacksDir = path.join(dir, 'data_packs');
let architectsDir = path.join(dir, 'architects');

module.exports = { dir, projectsDir, dataPacksDir, architectsDir };