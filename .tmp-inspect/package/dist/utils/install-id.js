'use strict';

var crypto = require('crypto');
var nodeMachineId = require('node-machine-id');

function installID(projectId) {
    try {
        const machineId = nodeMachineId.machineIdSync();
        return projectId ? crypto.createHash('sha256').update(`${machineId}-${projectId}`).digest('hex') : crypto.randomUUID();
    } catch  {
        return crypto.randomUUID();
    }
}

exports.installID = installID;
//# sourceMappingURL=install-id.js.map
