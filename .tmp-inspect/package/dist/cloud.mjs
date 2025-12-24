import inquirer from 'inquirer';
import { services, cli } from '@strapi/cloud-cli';
import parseToChalk from './utils/parse-to-chalk.mjs';

function assertCloudError(e) {
    if (e.response === undefined) {
        throw Error('Expected CloudError');
    }
}
async function handleCloudLogin() {
    const logger = services.createLogger({
        silent: false,
        debug: process.argv.includes('--debug'),
        timestamp: false
    });
    const cloudApiService = await services.cloudApiFactory({
        logger
    });
    const defaultErrorMessage = 'An error occurred while trying to interact with Strapi servers. Use strapi deploy command once the project is generated.';
    let cloudApiConfig;
    try {
        const { data: config } = await cloudApiService.config();
        cloudApiConfig = config;
        if (!config?.featureFlags?.cloudLoginPromptEnabled) {
            return false;
        }
        logger.log(parseToChalk(config.projectCreation.introText));
    } catch (e) {
        logger.debug(e);
        logger.error(defaultErrorMessage);
        return false;
    }
    const { userChoice } = await inquirer.prompt(cloudApiConfig.projectCreation?.userChoice || [
        {
            type: 'list',
            name: 'userChoice',
            message: `Please log in or sign up.`,
            choices: [
                'Login/Sign up',
                'Skip'
            ]
        }
    ]);
    if (!userChoice.toLowerCase().includes('skip')) {
        const cliContext = {
            user: {
                id: ''
            },
            logger,
            cwd: process.cwd(),
            ...cloudApiConfig.projectCreation?.reference && {
                promptExperiment: cloudApiConfig.projectCreation?.reference
            }
        };
        try {
            await cli.login.action(cliContext, {
                showDashboardLink: false
            });
        } catch (e) {
            logger.debug(e);
            try {
                assertCloudError(e);
                if (e.response.status === 403) {
                    const message = typeof e.response.data === 'string' ? e.response.data : 'We are sorry, but we are not able to log you into Strapi servers at the moment.';
                    logger.warn(message);
                    return false;
                }
            } catch (e) {
            /* empty */ }
            logger.error(defaultErrorMessage);
            return false;
        }
        return true;
    }
    return false;
}

export { handleCloudLogin };
//# sourceMappingURL=cloud.mjs.map
