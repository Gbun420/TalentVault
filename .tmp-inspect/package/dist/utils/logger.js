'use strict';

var chalk = require('chalk');

const MAX_PREFIX_LENGTH = 8;
const badge = (text, bgColor, textColor = chalk.black)=>{
    const wrappedText = ` ${text} `;
    const repeat = Math.max(0, MAX_PREFIX_LENGTH - wrappedText.length);
    return ' '.repeat(repeat) + bgColor(textColor(wrappedText));
};
const textIndent = (text, indentFirst = true, indent = MAX_PREFIX_LENGTH + 2)=>{
    const parts = Array.isArray(text) ? text : [
        text
    ];
    return parts.map((part, i)=>{
        if (i === 0 && !indentFirst) {
            return part;
        }
        return ' '.repeat(indent) + part;
    }).join('\n');
};
const logger = {
    log (message) {
        console.log(textIndent(message));
    },
    title (title, message) {
        const prefix = badge(title, chalk.bgBlueBright);
        console.log(`\n${prefix}  ${message}`);
    },
    info (message) {
        console.log(`${' '.repeat(7)}${chalk.cyan('●')}  ${message}`);
    },
    success (message) {
        console.log(`\n${' '.repeat(7)}${chalk.green('✓')}  ${chalk.green(message)}`);
    },
    fatal (message) {
        const prefix = badge('Error', chalk.bgRed);
        if (message) {
            console.error(`\n${prefix}  ${textIndent(message, false)}\n`);
        }
        process.exit(1);
    },
    error (message) {
        const prefix = badge('Error', chalk.bgRed);
        console.error(`\n${prefix}  ${textIndent(message, false)}\n`);
    },
    warn (message) {
        const prefix = badge('Warn', chalk.bgYellow);
        console.warn(`\n${prefix}  ${textIndent(message, false)}\n`);
    }
};

exports.logger = logger;
//# sourceMappingURL=logger.js.map
