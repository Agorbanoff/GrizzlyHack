"use client";
import { useState } from "react";
import Link from "next/link";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    fetch("http://localhost:6969/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Login failed");
        return res.json();
      })
      .then((data) => console.log("Login successful:", data))
      .catch((err) => console.error("Error during login:", err));
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
          {errors.username && (
            <p className="text-accent text-sm mt-1">{errors.username}</p>
          )}
        </div>

        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.password && (
            <p className="text-accent text-sm mt-1">{errors.password}</p>
          )}
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