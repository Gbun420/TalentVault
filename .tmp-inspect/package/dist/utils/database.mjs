import inquirer from 'inquirer';
import { logger } from './logger.mjs';

const DBOptions = [
    'dbclient',
    'dbhost',
    'dbport',
    'dbname',
    'dbusername',
    'dbpassword'
];
const VALID_CLIENTS = [
    'sqlite',
    'mysql',
    'postgres'
];
const DEFAULT_CONFIG = {
    client: 'sqlite',
    connection: {
        filename: '.tmp/data.db'
    }
};
async function dbPrompt() {
    const { useDefault } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'useDefault',
            message: 'Do you want to use the default database (sqlite) ?',
            default: true
        }
    ]);
    if (useDefault) {
        return DEFAULT_CONFIG;
    }
    const { client } = await inquirer.prompt([
        {
            type: 'list',
            name: 'client',
            message: 'Choose your default database client',
            choices: [
                'sqlite',
                'postgres',
                'mysql'
            ],
            default: 'sqlite'
        }
    ]);
    const questions = dbQuestions[client].map((q)=>q({
            client
        }));
    const responses = await inquirer.prompt(questions);
    return {
        client,
        connection: responses
    };
}
async function getDatabaseInfos(options) {
    if (options.skipDb) {
        return DEFAULT_CONFIG;
    }
    if (options.dbclient && !VALID_CLIENTS.includes(options.dbclient)) {
        logger.fatal(`Invalid --dbclient: ${options.dbclient}, expected one of ${VALID_CLIENTS.join(', ')}`);
    }
    const matchingArgs = DBOptions.filter((key)=>key in options);
    const missingArgs = DBOptions.filter((key)=>!(key in options));
    if (matchingArgs.length > 0 && matchingArgs.length !== DBOptions.length && options.dbclient !== 'sqlite') {
        logger.fatal(`Required database arguments are missing: ${missingArgs.join(', ')}.`);
    }
    const hasDBOptions = DBOptions.some((key)=>key in options);
    if (!hasDBOptions) {
        if (options.quickstart) {
            return DEFAULT_CONFIG;
        }
        return dbPrompt();
    }
    if (!options.dbclient) {
        return logger.fatal('Please specify the database client');
    }
    const database = {
        client: options.dbclient,
        connection: {
            host: options.dbhost,
            port: options.dbport,
            database: options.dbname,
            username: options.dbusername,
            password: options.dbpassword,
            filename: options.dbfile
        }
    };
    if (options.dbssl !== undefined) {
        database.connection.ssl = options.dbssl === 'true';
    }
    return database;
}
const sqlClientModule = {
    mysql: {
        mysql2: '3.9.8'
    },
    postgres: {
        pg: '8.8.0'
    },
    sqlite: {
        'better-sqlite3': '12.4.1'
    }
};
function addDatabaseDependencies(scope) {
    scope.dependencies = {
        ...scope.dependencies,
        ...sqlClientModule[scope.database.client]
    };
}
const DEFAULT_PORTS = {
    postgres: 5432,
    mysql: 3306,
    sqlite: undefined
};
const database = ()=>({
        type: 'input',
        name: 'database',
        message: 'Database name:',
        default: 'strapi',
        validate (value) {
            if (value.includes('.')) {
                return `The database name can't contain a "."`;
            }
            return true;
        }
    });
const host = ()=>({
        type: 'input',
        name: 'host',
        message: 'Host:',
        default: '127.0.0.1'
    });
const port = ({ client })=>({
        type: 'input',
        name: 'port',
        message: 'Port:',
        default: DEFAULT_PORTS[client]
    });
const username = ()=>({
        type: 'input',
        name: 'username',
        message: 'Username:'
    });
const password = ()=>({
        type: 'password',
        name: 'password',
        message: 'Password:',
        mask: '*'
    });
const ssl = ()=>({
        type: 'confirm',
        name: 'ssl',
        message: 'Enable SSL connection:',
        default: false
    });
const filename = ()=>({
        type: 'input',
        name: 'filename',
        message: 'Filename:',
        default: '.tmp/data.db'
    });
const dbQuestions = {
    sqlite: [
        filename
    ],
    postgres: [
        database,
        host,
        port,
        username,
        password,
        ssl
    ],
    mysql: [
        database,
        host,
        port,
        username,
        password,
        ssl
    ]
};

export { addDatabaseDependencies, getDatabaseInfos };
//# sourceMappingURL=database.mjs.map
