import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formState, setFormState] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formState);
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-card lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hidden bg-ink p-10 text-white lg:block">
          <p className="text-xs uppercase tracking-[0.4em] text-gold">Pulse Social</p>
          <h1 className="mt-6 font-display text-6xl leading-none">
            Share what matters.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/75">
            A modern social feed with profiles, follows, likes, comments, image uploads,
            notifications, and a clean API underneath.
          </p>
        </div>

        <div className="p-8 sm:p-12">
          <p className="text-xs uppercase tracking-[0.35em] text-coral">Welcome back</p>
          <h2 className="mt-4 font-display text-5xl text-ink">Log in</h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={formState.email}
              onChange={(event) =>
                setFormState((state) => ({ ...state, email: event.target.value }))
              }
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={formState.password}
              onChange={(event) =>
                setFormState((state) => ({ ...state, password: event.target.value }))
              }
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-coral">{error}</p>}

          <p className="mt-6 text-sm text-slate">
            New here?{" "}
            <Link to="/register" className="font-semibold text-ink hover:text-coral">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

