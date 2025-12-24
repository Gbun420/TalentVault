'use strict';

var chalk = require('chalk');
var semver = require('semver');
var engines = require('./engines.js');
var logger = require('./logger.js');

function checkNodeRequirements() {
    const currentNodeVersion = process.versions.node;
    // error if the node version isn't supported
    if (!semver.satisfies(currentNodeVersion, engines.engines.node)) {
        logger.logger.fatal([
            chalk.red(`You are running ${chalk.bold(`Node.js ${currentNodeVersion}`)}`),
            `Strapi requires ${chalk.bold(chalk.green(`Node.js ${engines.engines.node}`))}`,
            'Please make sure to use the right version of Node.'
        ]);
    } else if (semver.major(currentNodeVersion) % 2 !== 0) {
        logger.logger.warn([
            chalk.yellow(`You are running ${chalk.bold(`Node.js ${currentNodeVersion}`)}`),
            `Strapi only supports ${chalk.bold(chalk.green('LTS versions of Node.js'))}, other versions may not be compatible.`
        ]);
    }
}

exports.checkNodeRequirements = checkNodeRequirements;
//# sourceMappingURL=check-requirements.js.map
