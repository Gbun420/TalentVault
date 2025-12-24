/**
 * resume-match controller
 */

const { errors } = require('@strapi/utils');
const { blocksToText } = require('../../../utils/blocks-to-text');

const { ApplicationError, ValidationError } = errors;

const ensureText = (value: string) => (value || '').trim();

const buildJobDescription = (job: any) => {
  const sections = [
    blocksToText(job.description),
    blocksToText(job.responsibilities),
    blocksToText(job.requirements),
    ensureText(job.benefits),
  ].filter(Boolean);

  return sections.join('\n\n');
};

export default {
  async match(ctx: any) {
    const { candidateId, jobId } = ctx.request.body || {};

    if (!candidateId || !jobId) {
      throw new ValidationError('candidateId and jobId are required.');
    }

    const candidate = await strapi.entityService.findOne(
      'api::candidate-profile.candidate-profile',
      candidateId,
      {
        populate: {
          resume: true,
        },
      }
    );

    if (!candidate) {
      ctx.notFound('Candidate profile not found.');
      return;
    }

    const job = await strapi.entityService.findOne('api::job.job', jobId);

    if (!job) {
      ctx.notFound('Job not found.');
      return;
    }

    const resumeFile = Array.isArray(candidate.resume) ? candidate.resume[0] : candidate.resume;
    if (!resumeFile) {
      throw new ValidationError('Candidate profile does not have a resume file uploaded.');
    }

    const jobDescription = buildJobDescription(job);
    if (!jobDescription) {
      throw new ValidationError('Job description is empty.');
    }

    try {
      const result = await strapi
        .service('api::resume-match.resume-match')
        .match({ resumeFile, jobDescription });

      const matchData = result.match?.data || result.match || {};
      const resumeScore = Number(matchData.new_score ?? matchData.original_score ?? 0) || 0;
      const keywordMatches = matchData.skill_comparison || null;

      await strapi.entityService.update('api::candidate-profile.candidate-profile', candidateId, {
        data: {
          resumeScore,
          matchAnalysis: matchData,
          keywordMatches,
        },
      });

      ctx.body = {
        data: {
          resumeScore,
          matchAnalysis: matchData,
          keywordMatches,
        },
      };
    } catch (error) {
      strapi.log.error('Resume match failed', error);
      throw new ApplicationError('Resume match failed. Check resume matcher service logs.');
    }
  },
};
