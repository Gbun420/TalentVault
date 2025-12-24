'use strict';

var path = require('node:path');
var chalk = require('chalk');
var execa = require('execa');
var fse = require('fs-extra');
var cloudCli = require('@strapi/cloud-cli');
var template = require('./utils/template.js');
var git = require('./utils/git.js');
var usage = require('./utils/usage.js');
var packageJson = require('./utils/package-json.js');
var dotEnv = require('./utils/dot-env.js');
var types = require('./types.js');
var logger = require('./utils/logger.js');
var gitignore = require('./utils/gitignore.js');
var getPackageManagerArgs = require('./utils/get-package-manager-args.js');

async function createStrapi(scope) {
    const { rootPath } = scope;
    try {
        await fse.ensureDir(rootPath);
        await createApp(scope);
    } catch (error) {
        await fse.remove(rootPath);
        throw error;
    }
}
async function createApp(scope) {
    const { rootPath, useTypescript, useExample, installDependencies, isQuickstart, template: template$1, packageManager, gitInit, runApp, isABTestEnabled } = scope;
    const shouldRunSeed = useExample && installDependencies;
    await usage.trackUsage({
        event: 'willCreateProject',
        scope
    });
    logger.logger.title('Strapi', `Creating a new application at ${chalk.green(rootPath)}`);
    if (!isQuickstart) {
        await usage.trackUsage({
            event: 'didChooseCustomDatabase',
            scope
        });
    } else {
        await usage.trackUsage({
            event: 'didChooseQuickstart',
            scope
        });
    }
    if (!template$1) {
        let templateName = useExample ? 'example' : 'vanilla';
        if (!useTypescript) {
            templateName = `${templateName}-js`;
        }
        const internalTemplatePath = path.join(__dirname, '../templates', templateName);
        if (await fse.exists(internalTemplatePath)) {
            await fse.copy(internalTemplatePath, rootPath);
        }
    } else {
        try {
            logger.logger.info(`${chalk.cyan('Installing template')} ${template$1}`);
            await template.copyTemplate(scope, rootPath);
            logger.logger.success('Template copied successfully.');
        } catch (error) {
            if (error instanceof Error) {
                logger.logger.fatal(`Template installation failed: ${error.message}`);
            }
            throw error;
        }
        if (!fse.existsSync(path.join(rootPath, 'package.json'))) {
            logger.logger.fatal(`Missing ${chalk.bold('package.json')} in template`);
        }
    }
    await usage.trackUsage({
        event: 'didCopyProjectFiles',
        scope
    });
    try {
        await packageJson.createPackageJSON(scope);
        await usage.trackUsage({
            event: 'didWritePackageJSON',
            scope
        });
        // ensure node_modules is created
        await fse.ensureDir(path.join(rootPath, 'node_modules'));
        // create config/database
        await fse.writeFile(path.join(rootPath, '.env'), dotEnv.generateDotEnv(scope));
        await usage.trackUsage({
            event: 'didCopyConfigurationFiles',
            scope
        });
    } catch (err) {
        await fse.remove(rootPath);
        throw err;
    }
    // Create and save a growth sso trial license
    if (scope.shouldCreateGrowthSsoTrial) {
        try {
            const data = await cloudCli.createGrowthSsoTrial({
                strapiVersion: scope.strapiVersion
            });
            if (data?.license) {
                fse.writeFile(path.join(rootPath, 'license.txt'), data.license);
                logger.logger.log('Your 30 days trial will be applied automatically to your project. Enjoy!');
            }
        } catch (error) {
            logger.logger.error('Error while trying to create your trial. Please try again later.');
        }
    }
    if (installDependencies) {
        try {
            logger.logger.title('deps', `Installing dependencies with ${chalk.cyan(packageManager)}`);
            await usage.trackUsage({
                event: 'willInstallProjectDependencies',
                scope
            });
            await runInstall(scope);
            await usage.trackUsage({
                event: 'didInstallProjectDependencies',
                scope
            });
            logger.logger.success(`Dependencies installed`);
        } catch (error) {
            const stderr = types.isStderrError(error) ? error.stderr : '';
            await usage.trackUsage({
                event: 'didNotInstallProjectDependencies',
                scope,
                error: stderr.slice(-1024)
            });
            logger.logger.fatal([
                chalk.bold('Oh, it seems that you encountered an error while installing dependencies in your project'),
                '',
                `Don't give up, your project was created correctly`,
                '',
                `Fix the issues mentioned in the installation errors and try to run the following command:`,
                '',
                `cd ${chalk.green(rootPath)} && ${chalk.cyan(packageManager)} install`
            ]);
        }
    }
    await usage.trackUsage({
        event: 'didCreateProject',
        scope
    });
    // make sure a gitignore file is created regardless of the user using git or not
    if (!await fse.exists(path.join(rootPath, '.gitignore'))) {
        await fse.writeFile(path.join(rootPath, '.gitignore'), gitignore.gitIgnore);
    }
    // Init git
    if (gitInit) {
        logger.logger.title('git', 'Initializing git repository.');
        await git.tryGitInit(rootPath);
        logger.logger.success('Initialized a git repository.');
    }
    if (shouldRunSeed) {
        if (await fse.exists(path.join(rootPath, 'scripts/seed.js'))) {
            logger.logger.title('Seed', 'Seeding your database with sample data');
            try {
                await execa(packageManager, [
                    'run',
                    'seed:example'
                ], {
                    stdio: 'inherit',
                    cwd: rootPath
                });
                logger.logger.success('Sample data added to your database');
            } catch (error) {
                logger.logger.error('Failed to seed your database. Skipping');
            }
        }
    }
    const cmd = chalk.cyan(`${packageManager} run`);
    logger.logger.title('Strapi', `Your application was created!`);
    logger.logger.log([
        'Available commands in your project:',
        '',
        'Start Strapi in watch mode. (Changes in Strapi project files will trigger a server restart)',
        `${cmd} develop`,
        '',
        'Start Strapi without watch mode.',
        `${cmd} start`,
        '',
        'Build Strapi admin panel.',
        `${cmd} build`,
        '',
        'Deploy Strapi project.',
        `${cmd} deploy`,
        ''
    ]);
    if (useExample) {
        logger.logger.log([
            'Seed your database with sample data.',
            `${cmd} seed:example`,
            ''
        ]);
    }
    logger.logger.log([
        'Display all available commands.',
        `${cmd} strapi\n`
    ]);
    if (installDependencies) {
        logger.logger.log([
            'To get started run',
            '',
            `${chalk.cyan('cd')} ${rootPath}`,
            !shouldRunSeed && useExample ? `${cmd} seed:example && ${cmd} develop` : `${cmd} develop`
        ]);
    } else {
        logger.logger.log([
            'To get started run',
            '',
            `${chalk.cyan('cd')} ${rootPath}`,
            `${chalk.cyan(packageManager)} install`,
            !shouldRunSeed && useExample ? `${cmd} seed:example && ${cmd} develop` : `${cmd} develop`
        ]);
    }
    if (runApp && installDependencies) {
        logger.logger.title('Run', 'Running your Strapi application');
        try {
            await usage.trackUsage({
                event: 'willStartServer',
                scope
            });
            await execa(packageManager, [
                'run',
                'develop'
            ], {
                stdio: 'inherit',
                cwd: rootPath,
                env: {
                    FORCE_COLOR: '1'
                }
            });
        } catch (error) {
            if (typeof error === 'string' || error instanceof Error) {
                await usage.trackUsage({
                    event: 'didNotStartServer',
                    scope,
                    error
                });
            }
            logger.logger.fatal('Failed to start your Strapi application');
        }
    }
    if (isABTestEnabled) {
        await usage.trackUsage({
            event: 'didEnableABTest',
            scope
        });
    }
}
async function runInstall({ rootPath, packageManager }) {
    // include same cwd and env to ensure version check returns same version we use below
    const { envArgs, cmdArgs } = await getPackageManagerArgs.getInstallArgs(packageManager, {
        cwd: rootPath,
        env: {
            ...process.env,
            NODE_ENV: 'development'
        }
    });
    const options = {
        cwd: rootPath,
        stdio: 'inherit',
        env: {
            ...process.env,
            ...envArgs,
            NODE_ENV: 'development'
        }
    };
    const proc = execa(packageManager, cmdArgs, options);
    return proc;
}

exports.createStrapi = createStrapi;
//# sourceMappingURL=create-strapi.js.map
