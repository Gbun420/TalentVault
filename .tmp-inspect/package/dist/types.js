'use strict';

function isStderrError(error) {
    return typeof error === 'object' && error !== null && 'stderr' in error && typeof error.stderr === 'string';
}

exports.isStderrError = isStderrError;
//# sourceMappingURL=types.js.map
