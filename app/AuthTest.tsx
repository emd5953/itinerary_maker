// app/AuthTest.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthTest() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  if (!session) {
    return (
      <div className="p-4">
        <h2 className="text-xl mb-2">Not signed in</h2>
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Sign in with Google
        </button>
        <button
          onClick={() =>
            signIn("credentials", {
              email: "test@example.com",
              password: "password123",
            })
          }
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded"
        >
          Sign in with Credentials
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Signed in as {session.user?.email}</h2>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Sign Out
      </button>
    </div>
  );
}
