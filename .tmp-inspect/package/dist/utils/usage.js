'use strict';

var os = require('os');
var _ = require('lodash');

// Add properties from the package.json strapi key in the metadata
function addPackageJsonStrapiMetadata(metadata, scope) {
    const { packageJsonStrapi = {} } = scope;
    return _.defaults(metadata, packageJsonStrapi);
}
const boolToString = (value)=>(value === true).toString();
const getProperties = (scope, error)=>{
    const eventProperties = {
        error: typeof error === 'string' ? error : error && error.message
    };
    const userProperties = {
        os: os.type(),
        osPlatform: os.platform(),
        osArch: os.arch(),
        osRelease: os.release(),
        nodeVersion: process.versions.node
    };
    const groupProperties = {
        version: scope.strapiVersion,
        docker: scope.docker,
        useYarn: scope.packageManager === 'yarn',
        packageManager: scope.packageManager,
        /** @deprecated */ useTypescriptOnServer: boolToString(scope.useTypescript),
        /** @deprecated */ useTypescriptOnAdmin: boolToString(scope.useTypescript),
        useTypescript: boolToString(scope.useTypescript),
        isHostedOnStrapiCloud: process.env.STRAPI_HOSTING === 'strapi.cloud',
        aiLicenseKey: process.env.STRAPI_ADMIN_AI_LICENSE,
        noRun: boolToString(scope.runApp),
        projectId: scope.uuid,
        useExample: boolToString(scope.useExample),
        gitInit: boolToString(scope.gitInit),
        installDependencies: boolToString(scope.installDependencies)
    };
    return {
        eventProperties,
        userProperties,
        groupProperties: addPackageJsonStrapiMetadata(groupProperties, scope)
    };
};
function trackEvent(event, payload) {
    if (process.env.NODE_ENV === 'test') {
        return;
    }
    const analyticsUrl = process.env.STRAPI_ANALYTICS_URL || 'https://analytics.strapi.io';
    try {
        return fetch(`${analyticsUrl}/api/v2/track`, {
            method: 'POST',
            body: JSON.stringify({
                event,
                ...payload
            }),
            signal: AbortSignal.timeout(1000),
            headers: {
                'Content-Type': 'application/json',
                'X-Strapi-Event': event
            }
        }).catch(()=>{});
    } catch (err) {
        /** ignore errors */ return Promise.resolve();
    }
}
async function trackError({ scope, error }) {
    const properties = getProperties(scope, error);
    try {
        return await trackEvent('didNotCreateProject', {
            deviceId: scope.installId,
            ...properties
        });
    } catch (err) {
        /** ignore errors */ return Promise.resolve();
    }
}
async function trackUsage({ event, scope, error }) {
    const properties = getProperties(scope, error);
    try {
        return await trackEvent(event, {
            deviceId: scope.installId,
            ...properties
        });
    } catch (err) {
        /** ignore errors */ return Promise.resolve();
    }
}

exports.trackError = trackError;
exports.trackUsage = trackUsage;
//# sourceMappingURL=usage.js.map
