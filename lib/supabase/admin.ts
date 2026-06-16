// /lib/supabase/admin.ts
import { createClient as _createClient } from "@supabase/supabase-js";

// The project does not have generated Supabase database types yet.
// Keep this client intentionally loose until a Database type is introduced.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedAdminClient = ReturnType<typeof _createClient<any>>;

let adminClient: UntypedAdminClient | null = null;

export const createAdminClient = () => {
  if (adminClient) {
    return adminClient;
  }

  adminClient = _createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return adminClient;
};
