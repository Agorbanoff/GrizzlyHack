"use client";
import { useState } from "react";
import Link from "next/link";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!username) {
      newErrors.username = "Username is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    fetch("http://localhost:6969/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Login failed");
      } return res.json();
    })
    .then((data) => {
      console.log("Login successful:", data);
    })
    .catch((err) => {
      console.error("Error during login:", err);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-20 p-8 bg-gray-900 rounded-2xl shadow-xl border border-gray-700"
    >
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Welcome Back
      </h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
      </div>

      <div className="mb-6">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-normal py-3 rounded-lg shadow-md cursor-pointer"
      >
        Login
      </button>

      <p className="text-gray-400 text-sm text-center mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-indigo-500 font-medium hover:underline">
          Sign up here
        </Link>
      </p>
    </form>

  );
}

export default Login;
