// /lib/supabase/admin.ts
import { createClient as _createClient } from "@supabase/supabase-js";

export const createAdminClient = () => {
  return _createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};
