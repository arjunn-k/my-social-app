import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formState, setFormState] = useState({
    username: "",
    displayName: "",
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
      await register(formState);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-card lg:grid-cols-[0.85fr_1.15fr]">
        <div className="p-8 sm:p-12">
          <p className="text-xs uppercase tracking-[0.35em] text-moss">Join the network</p>
          <h1 className="mt-4 font-display text-5xl text-ink">Create account</h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              className="input"
              placeholder="Username"
              value={formState.username}
              onChange={(event) =>
                setFormState((state) => ({ ...state, username: event.target.value.toLowerCase() }))
              }
            />
            <input
              className="input"
              placeholder="Display name"
              value={formState.displayName}
              onChange={(event) =>
                setFormState((state) => ({ ...state, displayName: event.target.value }))
              }
            />
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
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-coral">{error}</p>}

          <p className="mt-6 text-sm text-slate">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-ink hover:text-coral">
              Log in
            </Link>
          </p>
        </div>

        <div className="hidden bg-gradient-to-br from-gold via-coral to-moss p-10 text-white lg:block">
          <p className="text-xs uppercase tracking-[0.4em] text-white/75">Build your signal</p>
          <h2 className="mt-6 font-display text-6xl leading-none">
            Meet people around ideas, not noise.
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-white/80">
            Profiles, follows, comments, notifications, and media uploads all ready to
            go from day one.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

