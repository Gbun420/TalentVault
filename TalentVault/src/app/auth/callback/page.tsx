import { redirect } from "next/navigation";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const mode = searchParams.mode as string | undefined;
  const oobCode = searchParams.oobCode as string | undefined;

  if (!mode || !oobCode) {
    redirect("/auth/login?message=Invalid verification link.");
  }

  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.append(key, value);
    }
  });

  redirect(`/auth/login?${params.toString()}`);
}
