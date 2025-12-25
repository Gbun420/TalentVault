'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatEnum } from '@/lib/formatters';

const sizeOptions = ['all', 'micro', 'small', 'medium', 'large', 'enterprise'];
const verifiedOptions = ['all', 'verified', 'pending'];

const selectClassName =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-slate-700 shadow-xs focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50';

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

export default function CompaniesList({ companies }) {
  const [query, setQuery] = useState('');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  const industries = useMemo(() => {
    const values = new Set(companies.map((company) => company.industry).filter(Boolean));
    return ['all', ...Array.from(values).sort()];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesQuery = normalizedQuery
        ? [company.name, company.industry, company.location]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedQuery))
        : true;

      const matchesSize = sizeFilter === 'all' || company.size === sizeFilter;
      const matchesVerified =
        verifiedFilter === 'all'
          ? true
          : verifiedFilter === 'verified'
          ? company.verified
          : !company.verified;
      const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter;

      return matchesQuery && matchesSize && matchesVerified && matchesIndustry;
    });
  }, [companies, query, sizeFilter, verifiedFilter, industryFilter]);

  const verifiedCount = filteredCompanies.filter((company) => company.verified).length;
  const uniqueRegions = new Set(
    filteredCompanies
      .map((company) => company.location)
      .filter(Boolean)
      .map((location) => String(location).split(',').slice(-1)[0].trim())
  );

  const handleReset = () => {
    setQuery('');
    setSizeFilter('all');
    setVerifiedFilter('all');
    setIndustryFilter('all');
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="border-black/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Partner companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{filteredCompanies.length}</div>
            <p className="text-xs text-slate-500">Matching filters</p>
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
            <div className="text-3xl font-semibold text-slate-900">{uniqueRegions.size}</div>
            <p className="text-xs text-slate-500">Operating footprints</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-black/10 bg-white/80">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Company directory</CardTitle>
              <p className="text-sm text-slate-500">{filteredCompanies.length} of {companies.length} companies</p>
            </div>
            <Button asChild size="sm">
              <Link href="/companies/new">New company</Link>
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              placeholder="Search company, industry, location"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select className={selectClassName} value={industryFilter} onChange={(event) => setIndustryFilter(event.target.value)}>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry === 'all' ? 'All industries' : industry}
                </option>
              ))}
            </select>
            <select className={selectClassName} value={sizeFilter} onChange={(event) => setSizeFilter(event.target.value)}>
              {sizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All sizes' : formatEnum(option)}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <select className={selectClassName} value={verifiedFilter} onChange={(event) => setVerifiedFilter(event.target.value)}>
                {verifiedOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All status' : formatEnum(option)}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length ? (
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
                {filteredCompanies.map((company) => (
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
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              No companies match these filters yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
