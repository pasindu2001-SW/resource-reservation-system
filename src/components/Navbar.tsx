'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { Calendar, UserCheck, Shield, Plus, LogOut, LogIn } from 'lucide-react';
import { Button } from './ui/Button';

interface NavbarProps {
  activeTab: 'resources' | 'schedule' | 'my-reservations';
  setActiveTab: (tab: 'resources' | 'schedule' | 'my-reservations') => void;
  onOpenBookingModal: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenBookingModal,
}: NavbarProps) {
  const router = useRouter();
  const { currentUser, logout } = useUser();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13 sm:h-16 gap-1.5 sm:gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="font-bold text-xs sm:text-base text-slate-900 tracking-tight">
              ResourceHub
            </span>
          </div>

          {/* Navigation Tabs (Tablet & Desktop: md and up) */}
          <nav className="hidden md:flex space-x-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-2.5 lg:px-3.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'resources'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Catalog
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-2.5 lg:px-3.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Schedule
            </button>
            <button
              onClick={() => setActiveTab('my-reservations')}
              className={`px-2.5 lg:px-3.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'my-reservations'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reservations
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {currentUser ? (
              <>
                {/* Proportional User Badge */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-1.5 sm:px-2.5 py-1 rounded-lg">
                  {currentUser.role === 'ADMIN' ? (
                    <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 flex-shrink-0" />
                  ) : (
                    <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 flex-shrink-0" />
                  )}
                  {/* Shows first name on mobile, full role tag only on tablet/desktop */}
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-800 truncate max-w-[55px] sm:max-w-[120px]">
                    {currentUser.name.split(' ')[0]}
                    <span className="hidden sm:inline text-slate-500 font-normal ml-0.5">
                      ({currentUser.role})
                    </span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-0.5 rounded text-slate-400 hover:text-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>

                {/* Compact Book Slot Button */}
                <Button
                  size="sm"
                  onClick={onOpenBookingModal}
                  className="flex items-center gap-1 text-[11px] sm:text-xs py-1 px-2 sm:py-1.5 sm:px-3 whitespace-nowrap"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Book Slot</span>
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={() => router.push('/login')}
                className="flex items-center gap-1 text-[11px] sm:text-xs py-1 px-2.5 sm:py-1.5 sm:px-3"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Tab Segment Bar (Underneath on mobile < 768px) */}
        <div className="flex md:hidden pb-2 pt-0.5">
          <div className="w-full grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg text-center">
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-1 text-[11px] font-semibold rounded-md transition-colors ${
                activeTab === 'resources'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Catalog
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-1 text-[11px] font-semibold rounded-md transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('my-reservations')}
              className={`py-1 text-[11px] font-semibold rounded-md transition-colors ${
                activeTab === 'my-reservations'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bookings
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}