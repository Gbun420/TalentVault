import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CandidateForm from '@/components/forms/candidate-form';

export default function EditCandidatePage({ params }) {
  return (
    <Card className="border-black/10 bg-white/80">
      <CardHeader>
        <CardTitle className="text-lg">Edit candidate</CardTitle>
      </CardHeader>
      <CardContent>
        <CandidateForm candidateId={params.id} />
      </CardContent>
    </Card>
  );
}
