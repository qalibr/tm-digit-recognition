import supabase from "../supabaseClient.jsx";
import useAuth from "./useAuth.jsx";

function Login() {
  const {user} = useAuth();

  const loginGitHub = async () => {
    const {user, session, error} = await supabase.auth.signInWithOAuth({
      provider: "github",
    });

    if (error) console.error('Login failed:', error.message);
    else console.log('Login successful:', user, session);
  };

  const logoutGitHub = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>
      {!user && <button onClick={loginGitHub}>Login with GitHub</button>}
      {user && <button onClick={logoutGitHub}>Logout</button>}
    </div>
  );
}

export default Login;
