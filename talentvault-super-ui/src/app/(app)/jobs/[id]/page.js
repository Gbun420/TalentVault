import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import JobForm from '@/components/forms/job-form';

export default function EditJobPage({ params }) {
  return (
    <Card className="border-black/10 bg-white/80">
      <CardHeader>
        <CardTitle className="text-lg">Edit role</CardTitle>
      </CardHeader>
      <CardContent>
        <JobForm jobId={params.id} />
      </CardContent>
    </Card>
  );
}
