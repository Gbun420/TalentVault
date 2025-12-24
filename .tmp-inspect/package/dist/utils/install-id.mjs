import crypto from 'crypto';
import { machineIdSync } from 'node-machine-id';

function installID(projectId) {
    try {
        const machineId = machineIdSync();
        return projectId ? crypto.createHash('sha256').update(`${machineId}-${projectId}`).digest('hex') : crypto.randomUUID();
    } catch  {
        return crypto.randomUUID();
    }
}

export { installID };
//# sourceMappingURL=install-id.mjs.map
