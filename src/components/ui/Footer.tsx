import React from 'react';

interface FooterProps {
  isDatabaseConnected?: boolean;
}

export function Footer({ isDatabaseConnected = true }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-500 py-5 mt-auto text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span className="font-semibold text-slate-700 block sm:inline">
            Resource Reservation Management System
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
          {/* Dynamic Database Status Badge */}
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                isDatabaseConnected ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span className={isDatabaseConnected ? 'text-slate-700' : 'text-red-600'}>
              {isDatabaseConnected ? 'PostgreSQL: Connected' : 'PostgreSQL: Offline'}
            </span>
          </span>

          <span className="hidden xs:inline text-slate-300">·</span>
          <span className="text-slate-500">Prisma ORM</span>
          <span className="hidden xs:inline text-slate-300">·</span>
          <span className="text-slate-500">Next.js App Router</span>
        </div>
      </div>
    </footer>
  );
}