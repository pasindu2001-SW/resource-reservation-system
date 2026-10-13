export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Resource Reservation System
        </h1>
        <p className="text-slate-600 text-sm mb-4">
          PrimeWave Lab Technical Assessment
        </p>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          ● Ready to Build
        </div>
      </div>
    </main>
  );
}