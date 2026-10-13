import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-8 mt-16 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-200">
            Resource Reservation Management System
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Technical Assessment for PrimeWave Lab (Pvt) Ltd · Built with Next.js & PostgreSQL
          </p>
        </div>
        <div className="flex items-center space-x-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Database: Connected (PostgreSQL)
          </span>
          <span>Prisma ORM</span>
          <span>TypeScript</span>
        </div>
      </div>
    </footer>
  );
}