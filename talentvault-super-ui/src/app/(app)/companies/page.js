import CompaniesList from '@/components/lists/companies-list';
import { formatLocation } from '@/lib/formatters';
import { getCompanies } from '@/lib/strapi-server';

export const revalidate = 60;

const fallbackCompanies = [
  {
    id: 'company-1',
    name: 'Lumen Labs',
    industry: 'Fintech',
    size: 'medium',
    location: 'London, UK',
    verified: true,
    website: 'https://lumenlabs.com',
  },
  {
    id: 'company-2',
    name: 'NovaStack',
    industry: 'SaaS',
    size: 'small',
    location: 'Berlin, DE',
    verified: false,
    website: 'https://novastack.io',
  },
  {
    id: 'company-3',
    name: 'Helix Edge',
    industry: 'Cloud',
    size: 'large',
    location: 'Remote',
    verified: true,
    website: 'https://helixedge.com',
  },
];

export default async function CompaniesPage() {
  let companies = fallbackCompanies;

  try {
    const companiesResponse = await getCompanies();
    const normalized = companiesResponse?.data?.map((company) => {
      const attributes = company?.attributes || {};
      return {
        id: company.id,
        name: attributes.name || 'Unnamed company',
        industry: attributes.industry?.data?.attributes?.name || 'Unassigned',
        size: attributes.size || 'small',
        location: formatLocation(attributes.location),
        verified: Boolean(attributes.verified),
        website: attributes.website || null,
      };
    });
    if (normalized?.length) {
      companies = normalized;
    }
  } catch (error) {
    // Keep fallback companies when Strapi is unavailable.
  }

  return <CompaniesList companies={companies} />;
}
