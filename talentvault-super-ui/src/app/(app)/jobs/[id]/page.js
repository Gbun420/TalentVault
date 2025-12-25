import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import JobForm from '@/components/forms/job-form';

export default function EditJobPage({ params }) {
  return (
    <Card className="border-black/10 bg-white/80">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">Edit role</CardTitle>
          <p className="text-sm text-slate-500">Update role details or open the pipeline board.</p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/jobs/${params.id}/pipeline`}>View pipeline</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <JobForm jobId={params.id} />
      </CardContent>
    </Card>
  );
}
