// app/page.tsx
import AuthTest from "./AuthTest";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to aSpot</h1>
      <AuthTest />
    </main>
  );
}
