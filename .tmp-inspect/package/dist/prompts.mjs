import inquirer from 'inquirer';

async function directory() {
    const { directory } = await inquirer.prompt([
        {
            type: 'input',
            default: 'my-strapi-project',
            name: 'directory',
            message: 'What is the name of your project?'
        }
    ]);
    return directory;
}
async function typescript() {
    const { useTypescript } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'useTypescript',
            message: 'Start with Typescript?',
            default: true
        }
    ]);
    return useTypescript;
}
async function example() {
    const { useExample } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'useExample',
            message: 'Start with an example structure & data?',
            default: false
        }
    ]);
    return useExample;
}
async function gitInit() {
    const { gitInit } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'gitInit',
            message: 'Initialize a git repository?',
            default: true
        }
    ]);
    return gitInit;
}
async function installDependencies(packageManager) {
    const { installDependencies } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'installDependencies',
            message: `Install dependencies with ${packageManager}?`,
            default: true
        }
    ]);
    return installDependencies;
}
async function enableABTests() {
    const { enableABTests } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'enableABTests',
            message: `Participate in anonymous A/B testing (to improve Strapi)?`,
            default: false
        }
    ]);
    return enableABTests;
}

export { directory, enableABTests, example, gitInit, installDependencies, typescript };
//# sourceMappingURL=prompts.mjs.map
