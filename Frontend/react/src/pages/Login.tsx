import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import type { AxiosError } from "axios";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.login(email, password);
      nav("/");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(
        error?.response?.data?.message || error?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm mx-auto space-y-4">
      <h2 className="text-2xl font-display font-bold text-center text-slate-900">
        Welcome back
      </h2>
      <p className="text-sm text-center text-slate-500 -mt-2">
        Log in to manage your favorite repos.
      </p>

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
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      <button
        className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? "Logging in…" : "Log in"}
      </button>

      <p className="text-sm text-center text-slate-500">
        Don't have an account?{" "}
        <Link className="font-medium text-brand-600 hover:underline" to="/register">
          Create one
        </Link>
      </p>
    </form>
  );
}
