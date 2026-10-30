import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bone">
      <div className="mx-auto w-full max-w-md px-4 py-16 space-y-4">
        <div className="font-mono text-[10px] uppercase opacity-70">// 404</div>
        <h1 className="font-display text-4xl leading-none">THAT PAGE ISN&apos;T HERE.</h1>
        <p className="font-mono text-sm">Try one of these instead.</p>
        <ul className="font-mono text-sm space-y-2">
          <li><Link className="underline" href="/dashboard">Your lessons</Link></li>
          <li><Link className="underline" href="/setup">Get Live ready</Link></li>
          <li><Link className="underline" href="/beat">Make a beat</Link></li>
          <li><Link className="underline" href="/atlas">What every device does</Link></li>
        </ul>
      </div>
    </main>
  );
}
