import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center">Welcome to My App!</h1>
        <Link href="/login" className="text-blue-500 underline text-center">Login</Link>
        <Link href="/signup" className="text-green-500 underline text-center">Sign Up</Link>
      </div>
    </div>
  );
}
