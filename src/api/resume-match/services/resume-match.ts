/**
 * resume-match service
 */

const { errors } = require('@strapi/utils');

const { ApplicationError } = errors;

const DEFAULT_MATCHER_URL = 'http://localhost:8000';

const getMatcherUrl = () => {
  return process.env.RESUME_MATCHER_URL || DEFAULT_MATCHER_URL;
};

const getAbsoluteFileUrl = (file: any) => {
  if (!file || !file.url) return '';
  if (file.url.startsWith('http')) return file.url;

  const serverUrl =
    strapi.config.get('server.url') ||
    process.env.PUBLIC_URL ||
    process.env.STRAPI_ADMIN_BACKEND_URL;

  if (!serverUrl) return '';
  return `${serverUrl}${file.url}`;
};

const fetchFileBuffer = async (url: string) => {
  const fetchFn = (globalThis as any).fetch;
  if (!fetchFn) {
    throw new ApplicationError('Fetch is not available in this runtime.');
  }

  const response = await fetchFn(url);
  if (!response.ok) {
    throw new ApplicationError(`Failed to fetch resume file: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const uploadResume = async (matcherUrl: string, resumeFile: any) => {
  const fileUrl = getAbsoluteFileUrl(resumeFile);
  if (!fileUrl) {
    throw new ApplicationError('Unable to resolve resume file URL.');
  }

  const fileBuffer = await fetchFileBuffer(fileUrl);
  const FormDataCtor = (globalThis as any).FormData;
  const BlobCtor = (globalThis as any).Blob;

  if (!FormDataCtor || !BlobCtor) {
    throw new ApplicationError('FormData/Blob are not available in this runtime.');
  }

  const formData = new FormDataCtor();
  const fileName = resumeFile.name || 'resume.pdf';
  const mimeType = resumeFile.mime || 'application/pdf';
  const blob = new BlobCtor([fileBuffer], { type: mimeType });

  formData.append('file', blob, fileName);

  const response = await (globalThis as any).fetch(`${matcherUrl}/api/v1/resume/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApplicationError(`Resume upload failed: ${response.status} ${errorText}`);
  }

  return response.json();
};

const uploadJob = async (matcherUrl: string, resumeId: string, jobDescription: string) => {
  const response = await (globalThis as any).fetch(`${matcherUrl}/api/v1/job/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      job_descriptions: [jobDescription],
      resume_id: resumeId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApplicationError(`Job upload failed: ${response.status} ${errorText}`);
  }

  return response.json();
};

const requestMatch = async (matcherUrl: string, resumeId: string, jobId: string) => {
  const response = await (globalThis as any).fetch(`${matcherUrl}/api/v1/resume/improve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      resume_id: resumeId,
      job_id: jobId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApplicationError(`Match request failed: ${response.status} ${errorText}`);
  }

  return response.json();
};

export default () => ({
  async match({ resumeFile, jobDescription }: { resumeFile: any; jobDescription: string }) {
    const matcherUrl = getMatcherUrl();

    const resumeResult = await uploadResume(matcherUrl, resumeFile);
    const resumeId = resumeResult.resume_id || resumeResult.resumeId;
    if (!resumeId) {
      throw new ApplicationError('Resume matcher did not return resume_id.');
    }

    const jobResult = await uploadJob(matcherUrl, resumeId, jobDescription);
    const jobId = Array.isArray(jobResult.job_id) ? jobResult.job_id[0] : jobResult.job_id;
    if (!jobId) {
      throw new ApplicationError('Resume matcher did not return job_id.');
    }

    const matchResult = await requestMatch(matcherUrl, resumeId, jobId);

    return {
      resume: resumeResult,
      job: jobResult,
      match: matchResult,
    };
  },
});
