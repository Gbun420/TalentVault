'use strict';

var path = require('path');
var _ = require('lodash');
var fse = require('fs-extra');
var engines = require('./engines.js');

async function createPackageJSON(scope) {
    const { sortPackageJson } = await import('sort-package-json');
    const pkgJSONPath = path.join(scope.rootPath, 'package.json');
    const existingPkg = await fse.readJSON(pkgJSONPath).catch(()=>({}));
    const pkg = {
        name: _.kebabCase(scope.name),
        private: true,
        version: '0.1.0',
        description: 'A Strapi application',
        devDependencies: scope.devDependencies ?? {},
        dependencies: scope.dependencies ?? {},
        strapi: {
            ...scope.packageJsonStrapi ?? {},
            uuid: scope.uuid,
            installId: scope.installId
        },
        engines: engines.engines
    };
    // copy templates
    await fse.writeJSON(pkgJSONPath, sortPackageJson(_.merge(existingPkg, pkg)), {
        spaces: 2
    });
}

exports.createPackageJSON = createPackageJSON;
//# sourceMappingURL=package-json.js.map
