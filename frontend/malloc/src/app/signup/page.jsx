"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function SignUp() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const u = username.trim();
    const p = password.trim();
    const pc = passwordConfirm.trim();

    if (!u || !p || !pc) {
      toast("Missing fields", {
        description: "Fill username, password, and confirm password.",
      });
      return;
    }

    if (u.length < 3) {
      toast("Invalid username", {
        description: "Username must be at least 3 characters.",
      });
      return;
    }

    if (p !== pc) {
      toast("Passwords do not match", {
        description: "Make sure both passwords are the same.",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:6969/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
        credentials: "include",
      });

      if (!res.ok) {
        toast("Sign up failed", {
          description: "Try a different username or password.",
        });
        return;
      }

      const text = (await res.text()).trim();

      if (text === "Successfully signed up!") {
        toast("Account created", {
          description: "You can now log in.",
          action: {
            label: "Login",
            onClick: () => router.replace("/login"),
          },
          duration: 3500,
        });
        return;
      }

      toast("Unexpected response", {
        description: "Please try again.",
      });
    } catch {
      toast("Network error", {
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
          Create an Account
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

        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            placeholder="Confirm Password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-hover transition-colors text-white font-normal py-3 rounded-lg shadow-md cursor-pointer"
        >
          Sign Up
        </button>

        <p className="text-muted text-sm text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignUp;