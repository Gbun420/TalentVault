import path from 'node:path';
import url from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import * as tar from 'tar';
import retry from 'async-retry';
import fse from 'fs-extra';

const stripTrailingSlash = (str)=>{
    return str.endsWith('/') ? str.slice(0, -1) : str;
};
// Merge template with new project being created
async function copyTemplate(scope, rootPath) {
    const { template } = scope;
    if (!template) {
        throw new Error('Missing template or example app option');
    }
    if (await isOfficialTemplate(template, scope.templateBranch)) {
        await retry(()=>downloadGithubRepo(rootPath, {
                owner: 'strapi',
                repo: 'strapi',
                branch: scope.templateBranch,
                subPath: `templates/${template}`
            }), {
            retries: 3,
            onRetry (err, attempt) {
                console.log(`Retrying to download the template. Attempt ${attempt}. Error: ${err}`);
            }
        });
        return;
    }
    if (isLocalTemplate(template)) {
        const filePath = template.startsWith('file://') ? url.fileURLToPath(template) : template;
        await fse.copy(filePath, rootPath);
    }
    if (isGithubShorthand(template)) {
        const [owner, repo, ...pathSegments] = template.split('/');
        const subPath = pathSegments.length ? pathSegments.join('/') : scope.templatePath;
        await retry(()=>downloadGithubRepo(rootPath, {
                owner,
                repo,
                branch: scope.templateBranch,
                subPath
            }), {
            retries: 3,
            onRetry (err, attempt) {
                console.log(`Retrying to download the template. Attempt ${attempt}. Error: ${err}`);
            }
        });
        return;
    }
    if (isGithubRepo(template)) {
        const url = new URL(template);
        const [owner, repo, t, branch, ...pathSegments] = stripTrailingSlash(url.pathname.slice(1)).split('/');
        if (t !== undefined && t !== 'tree') {
            throw new Error(`Invalid GitHub template URL: ${template}`);
        }
        if (scope.templateBranch) {
            await retry(()=>downloadGithubRepo(rootPath, {
                    owner,
                    repo,
                    branch: scope.templateBranch,
                    subPath: scope.templatePath
                }), {
                retries: 3,
                onRetry (err, attempt) {
                    console.log(`Retrying to download the template. Attempt ${attempt}. Error: ${err}`);
                }
            });
            return;
        }
        await retry(()=>downloadGithubRepo(rootPath, {
                owner,
                repo,
                branch: decodeURIComponent(branch) ?? scope.templateBranch,
                subPath: pathSegments.length ? decodeURIComponent(pathSegments.join('/')) : scope.templatePath
            }), {
            retries: 3,
            onRetry (err, attempt) {
                console.log(`Retrying to download the template. Attempt ${attempt}. Error: ${err}`);
            }
        });
        throw new Error(`Invalid GitHub template URL: ${template}`);
    }
}
async function downloadGithubRepo(rootPath, { owner, repo, branch, subPath }) {
    const filePath = subPath ? subPath.split('/').join(path.posix.sep) : null;
    let checkContentUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    if (filePath) {
        checkContentUrl = `${checkContentUrl}/${filePath}`;
    }
    if (branch) {
        checkContentUrl = `${checkContentUrl}?ref=${branch}`;
    }
    const checkRes = await fetch(checkContentUrl, {
        method: 'HEAD'
    });
    if (checkRes.status !== 200) {
        throw new Error(`Could not find a template at https://github.com/${owner}/${repo}${branch ? ` on branch ${branch}` : ''}${filePath ? ` at path ${filePath}` : ''}`);
    }
    let url = `https://api.github.com/repos/${owner}/${repo}/tarball`;
    if (branch) {
        url = `${url}/${branch}`;
    }
    const res = await fetch(url);
    if (!res.body) {
        throw new Error(`Failed to download ${url}`);
    }
    await pipeline(// @ts-expect-error - Readable is not a valid source
    Readable.fromWeb(res.body), tar.x({
        cwd: rootPath,
        strip: filePath ? filePath.split('/').length + 1 : 1,
        filter (path) {
            if (filePath) {
                return path.split('/').slice(1).join('/').startsWith(filePath);
            }
            return true;
        }
    }));
}
function isLocalTemplate(template) {
    return template.startsWith('file://') || fse.existsSync(path.isAbsolute(template) ? template : path.resolve(process.cwd(), template));
}
function isGithubShorthand(value) {
    if (isValidUrl(value)) {
        return false;
    }
    return /^[\w-]+\/[\w-.]+(\/[\w-.]+)*$/.test(value);
}
function isGithubRepo(value) {
    try {
        const url = new URL(value);
        return url.origin === 'https://github.com';
    } catch  {
        return false;
    }
}
function isValidUrl(value) {
    try {
        // eslint-disable-next-line no-new
        new URL(value);
        return true;
    } catch  {
        return false;
    }
}
const OFFICIAL_NAME_REGEX = /^[a-zA-Z]*$/;
async function isOfficialTemplate(template, branch) {
    if (isValidUrl(template) || !OFFICIAL_NAME_REGEX.test(template)) {
        return false;
    }
    const res = await fetch(`https://api.github.com/repos/strapi/strapi/contents/templates/${template}?${branch ? `ref=${branch}` : ''}`, {
        method: 'HEAD'
    });
    return res.status === 200;
}

export { copyTemplate };
//# sourceMappingURL=template.mjs.map
