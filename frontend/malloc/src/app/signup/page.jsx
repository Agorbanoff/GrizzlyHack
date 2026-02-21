"use client";
import { useState } from "react";
import Link from "next/link";

function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be at least 6 characters and include a number";
    }

    if (!passwordConfirm) {
      newErrors.passwordConfirm = "Please confirm your password";
    } else if (password !== passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      fetch("http://localhost:6969/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Sign Up failed");
          return res.json();
        })
        .then((data) => console.log("Sign Up successful:", data))
        .catch((err) => console.error("Error during sign up:", err));

      setUsername("");
      setPassword("");
      setPasswordConfirm("");
      setErrors({});
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
          {errors.username && (
            <p className="text-accent text-sm mt-1">{errors.username}</p>
          )}
        </div>

        <div className="mb-4">
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

        <div className="mb-6">
          <input
            type="password"
            placeholder="Confirm Password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.passwordConfirm && (
            <p className="text-accent text-sm mt-1">{errors.passwordConfirm}</p>
          )}
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