import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CompanyForm from '@/components/forms/company-form';

export default function NewCompanyPage() {
  return (
    <Card className="border-black/10 bg-white/80">
      <CardHeader>
        <CardTitle className="text-lg">Add new company</CardTitle>
      </CardHeader>
      <CardContent>
        <CompanyForm />
      </CardContent>
    </Card>
  );
}
