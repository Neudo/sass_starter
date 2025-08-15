import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useShowUserInfos(params: string) {
  const [userInfo, setUserInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          setError("User not found");
          setUserInfo(null);
          return;
        }

        switch (params) {
          case "name":
            // Try display_name first, then name, then full_name
            setUserInfo(
              user.user_metadata.display_name || 
              user.user_metadata.name || 
              user.user_metadata.full_name || 
              null
            );
            break;
          case "display_name":
            setUserInfo(user.user_metadata.display_name || null);
            break;
          case "email":
            setUserInfo(user.email || null);
            break;
          case "sub":
            setUserInfo(user.id || null);
            break;
          default:
            setUserInfo(null);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("Failed to fetch user info");
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [params]);

  return { userInfo, loading, error };
}
