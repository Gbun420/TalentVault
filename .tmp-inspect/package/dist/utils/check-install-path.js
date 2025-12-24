'use strict';

var path = require('node:path');
var chalk = require('chalk');
var fse = require('fs-extra');
var logger = require('./logger.js');

// Checks if the an empty directory exists at rootPath
async function checkInstallPath(directory) {
    const rootPath = path.resolve(directory);
    if (await fse.pathExists(rootPath)) {
        const stat = await fse.stat(rootPath);
        if (!stat.isDirectory()) {
            logger.logger.fatal(`${chalk.green(rootPath)} is not a directory. Make sure to create a Strapi application in an empty directory.`);
        }
        const files = await fse.readdir(rootPath);
        if (files.length > 1) {
            logger.logger.fatal([
                'You can only create a Strapi app in an empty directory',
                `Make sure ${chalk.green(rootPath)} is empty.`
            ]);
        }
    }
    return rootPath;
}

exports.checkInstallPath = checkInstallPath;
//# sourceMappingURL=check-install-path.js.map
