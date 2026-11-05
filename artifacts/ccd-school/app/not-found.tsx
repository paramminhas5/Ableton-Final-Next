import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bone">
      <div className="mx-auto w-full max-w-md px-4 py-16 space-y-4">
        <div className="font-mono text-[10px] opacity-70">// 404</div>
        <h1 className="font-display text-4xl leading-none">that page isn&apos;t here.</h1>
        <p className="font-mono text-sm">try one of these instead.</p>
        <ul className="font-mono text-sm space-y-2">
          <li><Link className="underline" href="/dashboard">your lessons</Link></li>
          <li><Link className="underline" href="/setup">get live ready</Link></li>
          <li><Link className="underline" href="/beat">make a beat</Link></li>
          <li><Link className="underline" href="/atlas">what every device does</Link></li>
        </ul>
      </div>
    </main>
  );
}
