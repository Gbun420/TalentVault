import { redirect } from "next/navigation";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const paramsRecord = await searchParams;
  const mode = paramsRecord.mode as string | undefined;
  const oobCode = paramsRecord.oobCode as string | undefined;

  if (!mode || !oobCode) {
    redirect("/auth/login?message=Invalid verification link.");
  }

  const params = new URLSearchParams();
  Object.entries(paramsRecord).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.append(key, value);
    }
  });

  redirect(`/auth/login?${params.toString()}`);
}
