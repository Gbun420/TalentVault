# Resume Matcher integration

TalentVault calls the Resume Matcher backend to score a candidate resume against a job description.

## Required services

Resume Matcher runs its own FastAPI backend and database. Deploy the backend separately and expose it over HTTPS.

Quickstart (local):

```bash
git clone https://github.com/srbhr/Resume-Matcher.git
cd Resume-Matcher
chmod +x setup.sh
./setup.sh
./setup.sh --start-dev
```

The backend defaults to `http://localhost:8000`.

## Strapi configuration

Set these environment variables in Strapi (local `.env` or Strapi Cloud):

```
PUBLIC_URL=https://your-strapi-domain
RESUME_MATCHER_URL=https://your-resume-matcher-domain
```

## API usage

Call the custom endpoint with a candidate profile and job ID:

```bash
curl -X POST https://your-strapi-domain/api/resume-match \
  -H "Content-Type: application/json" \
  -d '{"candidateId": 1, "jobId": 1}'
```

The endpoint:
- uploads the candidate resume file to Resume Matcher
- uploads the job description
- requests a match analysis
- stores `resumeScore`, `matchAnalysis`, and `keywordMatches` on the candidate profile

## Notes

- Candidate profiles must have a resume file uploaded (`resume` media field).
- Resume Matcher requires PDF or DOCX files.
- Secure the route before production use (right now it is public).
