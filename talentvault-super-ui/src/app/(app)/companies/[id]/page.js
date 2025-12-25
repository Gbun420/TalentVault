import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CompanyForm from '@/components/forms/company-form';

export default function EditCompanyPage({ params }) {
  return (
    <Card className="border-black/10 bg-white/80">
      <CardHeader>
        <CardTitle className="text-lg">Edit company</CardTitle>
      </CardHeader>
      <CardContent>
        <CompanyForm companyId={params.id} />
      </CardContent>
    </Card>
  );
}
