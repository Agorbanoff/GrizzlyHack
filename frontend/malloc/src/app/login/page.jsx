
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function Login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      toast.error("Missing fields", {
        description: "Enter both username and password.",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:6969/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Login failed", {
          description: "Invalid username or password.",
        });
        return;
      }

      toast.success("Login successful", {
        description: "Welcome back",
      });

      router.push("/dashboard");
    } catch (err) {
      toast.error("Network error", {
        description: "Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-start justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm mt-20 p-8 bg-surface rounded-2xl shadow-xl border border-border"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
          Welcome Back
        </h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-hover transition-colors text-white font-normal py-3 rounded-lg shadow-md cursor-pointer"
        >
          Login
        </button>

        <p className="text-muted text-sm text-center mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
