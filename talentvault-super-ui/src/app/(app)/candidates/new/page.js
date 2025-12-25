import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CandidateForm from '@/components/forms/candidate-form';

export default function NewCandidatePage() {
  return (
    <Card className="border-black/10 bg-white/80">
      <CardHeader>
        <CardTitle className="text-lg">Add new candidate</CardTitle>
      </CardHeader>
      <CardContent>
        <CandidateForm />
      </CardContent>
    </Card>
  );
}
