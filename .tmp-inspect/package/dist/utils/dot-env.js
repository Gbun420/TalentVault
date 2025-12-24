'use strict';

var crypto = require('crypto');
var _ = require('lodash');

const generateASecret = ()=>crypto.randomBytes(16).toString('base64');
const envTmpl = `
# Server
HOST=0.0.0.0
PORT=1337

# Secrets
APP_KEYS=<%= appKeys %>
API_TOKEN_SALT=<%= apiTokenSalt %>
ADMIN_JWT_SECRET=<%= adminJwtToken %>
TRANSFER_TOKEN_SALT=<%= transferTokenSalt %>
ENCRYPTION_KEY=<%= encryptionKey %>

# Database
DATABASE_CLIENT=<%= database.client %>
DATABASE_HOST=<%= database.connection.host %>
DATABASE_PORT=<%= database.connection.port %>
DATABASE_NAME=<%= database.connection.database %>
DATABASE_USERNAME=<%= database.connection.username %>
DATABASE_PASSWORD=<%= database.connection.password %>
DATABASE_SSL=<%= database.connection.ssl %>
DATABASE_FILENAME=<%= database.connection.filename %>
`;
function generateDotEnv(scope) {
    const compile = _.template(envTmpl);
    return compile({
        appKeys: new Array(4).fill(null).map(generateASecret).join(','),
        apiTokenSalt: generateASecret(),
        transferTokenSalt: generateASecret(),
        adminJwtToken: generateASecret(),
        encryptionKey: generateASecret(),
        database: {
            client: scope.database.client,
            connection: {
                ...scope.database.connection,
                ssl: scope.database.connection?.ssl || false
            }
        }
    });
}

exports.generateDotEnv = generateDotEnv;
//# sourceMappingURL=dot-env.js.map
