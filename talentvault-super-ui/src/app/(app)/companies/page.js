import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatEnum, formatLocation } from '@/lib/formatters';
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

const sizeTone = (size) => {
  switch (size) {
    case 'micro':
      return 'border-slate-200 bg-slate-100 text-slate-600';
    case 'small':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'medium':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'large':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'enterprise':
      return 'border-violet-200 bg-violet-50 text-violet-700';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
};

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

  const verifiedCount = companies.filter((company) => company.verified).length;

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="border-black/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Partner companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{companies.length}</div>
            <p className="text-xs text-slate-500">Active hiring partners</p>
          </CardContent>
        </Card>
        <Card className="border-black/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{verifiedCount}</div>
            <p className="text-xs text-slate-500">Trusted accounts</p>
          </CardContent>
        </Card>
        <Card className="border-black/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Regions covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{Math.min(companies.length, 9)}</div>
            <p className="text-xs text-slate-500">Operating footprints</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-black/10 bg-white/80">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Company directory</CardTitle>
            <p className="text-sm text-slate-500">Keep company records aligned with active searches.</p>
          </div>
          <Button asChild size="sm">
            <Link href="/companies/new">New company</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{company.name}</div>
                    <div className="text-xs text-slate-500">{company.website || 'Website TBD'}</div>
                  </TableCell>
                  <TableCell>{company.industry}</TableCell>
                  <TableCell>
                    <Badge className={sizeTone(company.size)}>{formatEnum(company.size)}</Badge>
                  </TableCell>
                  <TableCell>{company.location}</TableCell>
                  <TableCell>
                    <Badge variant={company.verified ? 'default' : 'secondary'}>
                      {company.verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/companies/${company.id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
