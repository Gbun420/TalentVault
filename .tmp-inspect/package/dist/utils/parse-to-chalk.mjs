import chalk from 'chalk';

// TODO: move styles to API
const supportedStyles = {
    magentaBright: chalk.magentaBright,
    blueBright: chalk.blueBright,
    yellowBright: chalk.yellowBright,
    green: chalk.green,
    red: chalk.red,
    bold: chalk.bold,
    italic: chalk.italic
};
function parseToChalk(template) {
    let result = template;
    for (const [color, chalkFunction] of Object.entries(supportedStyles)){
        const regex = new RegExp(`{${color}}(.*?){/${color}}`, 'g');
        result = result.replace(regex, (_, p1)=>chalkFunction(p1.trim()));
    }
    return result;
}

export { parseToChalk as default };
//# sourceMappingURL=parse-to-chalk.mjs.map
