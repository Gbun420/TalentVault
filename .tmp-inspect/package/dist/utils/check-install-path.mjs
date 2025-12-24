import { resolve } from 'node:path';
import chalk from 'chalk';
import fse from 'fs-extra';
import { logger } from './logger.mjs';

// Checks if the an empty directory exists at rootPath
async function checkInstallPath(directory) {
    const rootPath = resolve(directory);
    if (await fse.pathExists(rootPath)) {
        const stat = await fse.stat(rootPath);
        if (!stat.isDirectory()) {
            logger.fatal(`${chalk.green(rootPath)} is not a directory. Make sure to create a Strapi application in an empty directory.`);
        }
        const files = await fse.readdir(rootPath);
        if (files.length > 1) {
            logger.fatal([
                'You can only create a Strapi app in an empty directory',
                `Make sure ${chalk.green(rootPath)} is empty.`
            ]);
        }
    }
    return rootPath;
}

export { checkInstallPath };
//# sourceMappingURL=check-install-path.mjs.map
