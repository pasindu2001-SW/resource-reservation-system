'use client';

import React from 'react';
import { useUser } from '@/context/UserContext';
import { Calendar, UserCheck, Shield, PlusCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'resources' | 'schedule' | 'my-reservations';
  setActiveTab: (tab: 'resources' | 'schedule' | 'my-reservations') => void;
  onOpenBookingModal: () => void;
}

export function Navbar({ activeTab, setActiveTab, onOpenBookingModal }: NavbarProps) {
  const { currentUser, setCurrentUser, users } = useUser();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Calendar className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">ReserveFlow</span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PrimeWave Lab
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'resources'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Resources & Directory
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'schedule'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Live Schedule Timeline
            </button>
            <button
              onClick={() => setActiveTab('my-reservations')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'my-reservations'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              My Bookings
            </button>
          </nav>

          {/* User Switcher & Action Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenBookingModal}
              className="hidden sm:inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Resource</span>
            </button>

            {/* Quick Demo Role Switcher */}
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              {currentUser?.role === 'ADMIN' ? (
                <Shield className="w-4 h-4 text-amber-400" />
              ) : (
                <UserCheck className="w-4 h-4 text-emerald-400" />
              )}
              <div className="text-left text-xs">
                <span className="block text-slate-400 text-[10px] leading-none">Acting as:</span>
                <select
                  value={currentUser?.id || ''}
                  onChange={(e) => {
                    const selected = users.find((u) => u.id === e.target.value);
                    if (selected) setCurrentUser(selected);
                  }}
                  className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-800 text-white">
                      {u.name} ({u.department} · {u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}