import CandidatesList from '@/components/lists/candidates-list';
import { formatLocation } from '@/lib/formatters';
import { getCandidates } from '@/lib/strapi-server';

export const revalidate = 60;

const fallbackCandidates = [
  {
    id: 'candidate-1',
    name: 'Maya Chen',
    headline: 'VP Product with fintech scale experience',
    location: 'San Francisco, CA',
    availability: 'two_weeks',
    experience: 12,
    resumeScore: 92,
    skills: ['Product Strategy', 'Growth', 'AI'],
  },
  {
    id: 'candidate-2',
    name: 'Andre Johnson',
    headline: 'Senior recruiter focused on executive search',
    location: 'Remote',
    availability: 'open',
    experience: 8,
    resumeScore: 87,
    skills: ['Sourcing', 'Talent Ops', 'Diversity'],
  },
  {
    id: 'candidate-3',
    name: 'Priya Patel',
    headline: 'Lead engineer, distributed systems',
    location: 'London, UK',
    availability: 'one_month',
    experience: 10,
    resumeScore: 90,
    skills: ['Go', 'Cloud', 'Security'],
  },
  {
    id: 'candidate-4',
    name: 'Noah Williams',
    headline: 'Revenue operations strategist',
    location: 'Toronto, CA',
    availability: 'immediate',
    experience: 6,
    resumeScore: 84,
    skills: ['RevOps', 'Analytics', 'Enablement'],
  },
];

export default async function CandidatesPage() {
  let candidates = fallbackCandidates;

  try {
    const candidatesResponse = await getCandidates();
    const normalized = candidatesResponse?.data?.map((candidate) => {
      const attributes = candidate?.attributes || {};
      const skills = attributes.skills?.data
        ?.map((skill) => skill?.attributes?.name)
        .filter(Boolean)
        .slice(0, 4);
      return {
        id: candidate.id,
        name: attributes.fullName || 'Unnamed candidate',
        headline: attributes.headline || 'Talent profile ready for review',
        location: formatLocation(attributes.location),
        availability: attributes.availability || 'open',
        experience: attributes.yearsExperience || null,
        resumeScore: Number(attributes.resumeScore || 0),
        skills: skills?.length ? skills : ['Talent Ops', 'Strategy'],
      };
    });
    if (normalized?.length) {
      candidates = normalized;
    }
  } catch (error) {
    // Keep fallback candidates when Strapi is unavailable.
  }

  return <CandidatesList candidates={candidates} />;
}
