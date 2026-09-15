import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import type { AxiosError } from "axios";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await auth.register({ name: name.trim(), email: email.trim(), password });
      nav("/");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      toast.error(
        error?.response?.data?.message ||
          (error instanceof Error && error.message) ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-display font-bold text-center text-slate-900">
        Create your account
      </h2>
      <p className="text-sm text-center text-slate-500 -mt-2">
        Save repos to your favorites and pick up where you left off.
      </p>

      <input
        className={inputClass}
        type="text"
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
        required
      />

      <input
        className={inputClass}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />
      <input
        className={inputClass}
        type="password"
        placeholder="Password (min. 8 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        minLength={8}
        required
      />

      <button
        className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-sm text-center text-slate-500">
        Already have an account?{" "}
        <Link className="font-medium text-brand-600 hover:underline" to="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}
