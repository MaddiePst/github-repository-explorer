import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import type { AxiosError } from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.login(email, password);
      nav("/");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      alert(error?.response?.data?.message || error?.message || "Login failed");
    }
  };

  return (
    // <div className="min-h-screen flex items-center justify-center">
    <form
      onSubmit={onSubmit}
      className="
      w-full
      max-w-sm
      mx-auto
      space-y-5
    "
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">Log In</h2>

      <input
        className="
        w-full
        border
        rounded-md
        px-4
        py-2.5
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
      "
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        className="
        w-full
        border
        rounded-md
        px-4
        py-2.5
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
      "
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        className="
        w-full
        bg-blue-900
        hover:bg-blue-800
        text-white
        py-2.5
        rounded-md
        transition
      "
        type="submit"
      >
        Login
      </button>

      <p className="text-sm text-center text-gray-600">
        Don’t have an account?{" "}
        <Link
          className="text-blue-900 font-medium hover:underline"
          to="/register"
        >
          Create account
        </Link>
      </p>
    </form>

    // </div>
  );
}
