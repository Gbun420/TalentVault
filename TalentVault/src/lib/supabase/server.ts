import { createServerClient, type CookieOptions } from "@supabase/ssr"; // Import CookieOptions type
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export const createSupabaseServerClient = () => {
  return createServerClient(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        async get(name: string) { // Make get async
          const cookieStore = await cookies(); // await cookies()
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) { // Make set async
          const cookieStore = await cookies(); // await cookies()
          cookieStore.set(name, value, options);
        },
        async remove(name: string, options: CookieOptions) { // Make remove async
          const cookieStore = await cookies(); // await cookies()
          cookieStore.set(name, "", options);
        },
      },
    }
  );
};
