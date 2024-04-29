import { useEffect, useState } from "react";
import supabase from "./supabaseClient.jsx";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error.message);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };

    checkSession().catch(console.error);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null),
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};

export default useAuth;
