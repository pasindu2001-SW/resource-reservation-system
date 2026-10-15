'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ResourceGrid } from '@/components/ResourceGrid';
import { ScheduleTimeline } from '@/components/ScheduleTimeline';
import { ReservationList } from '@/components/ReservationList';
import { ReservationModal } from '@/components/ReservationModal';
import { CreateResourceModal } from '@/components/CreateResourceModal';
import { RegisterUserModal } from '@/components/RegisterUserModal';
import { EditResourceModal } from '@/components/EditResourceModal';
import { Footer } from '@/components/ui/Footer';
import { Resource, Reservation } from '@/types';
import { useUser } from '@/context/UserContext';
import { Users, Calendar, CheckCircle, Wrench, UserPlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GridSkeleton } from '@/components/ui/LoadingState';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, isLoading: isAuthLoading } = useUser();

  const [activeTab, setActiveTab] = useState<'resources' | 'schedule' | 'my-reservations'>('resources');
  const [resources, setResources] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(true);

  // Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCreateResourceOpen, setIsCreateResourceOpen] = useState(false);
  const [isRegisterUserOpen, setIsRegisterUserOpen] = useState(false);
  const [isEditResourceOpen, setIsEditResourceOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);

  // Pre-fill selection
  const [preSelectedResourceId, setPreSelectedResourceId] = useState<string | null>(null);
  const [preSelectedDate, setPreSelectedDate] = useState<string | null>(null);
  const [preSelectedHour, setPreSelectedHour] = useState<number | null>(null);

  // If not logged in, redirect to /login
  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isAuthLoading, router]);

  const fetchData = useCallback(async () => {
    try {
      const [resResources, resReservations] = await Promise.all([
        fetch('/api/resources'),
        fetch('/api/reservations'),
      ]);

      if (!resResources.ok || !resReservations.ok) {
        setIsDbConnected(false);
        return;
      }

      const dataResources = await resResources.json();
      const dataReservations = await resReservations.json();

      if (dataResources.success) setResources(dataResources.data);
      if (dataReservations.success) setReservations(dataReservations.data);
      setIsDbConnected(true);
    } catch (err) {
      console.error('Failed to load data:', err);
      setIsDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  const handleBookFromCard = (resourceId: string) => {
    setPreSelectedResourceId(resourceId);
    setPreSelectedDate(null);
    setPreSelectedHour(null);
    setIsBookingOpen(true);
  };

  const handleSlotClick = (resourceId: string, dateStr: string, hour: number) => {
    setPreSelectedResourceId(resourceId);
    setPreSelectedDate(dateStr);
    setPreSelectedHour(hour);
    setIsBookingOpen(true);
  };

  const totalResources = resources.length;
  const availableNow = resources.filter((r) => r.status === 'AVAILABLE').length;
  const activeBookings = reservations.filter((r) => r.status === 'CONFIRMED').length;
  const maintenanceCount = resources.filter((r) => r.status === 'MAINTENANCE').length;

  if (isAuthLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent" />
          <p className="text-xs text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBookingModal={() => {
          setPreSelectedResourceId(null);
          setPreSelectedDate(null);
          setPreSelectedHour(null);
          setIsBookingOpen(true);
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full space-y-4 sm:space-y-6">
        {/* Simple Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Resource Reservation Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Welcome, <span className="font-semibold text-slate-800">{currentUser.name}</span> ({currentUser.department}) · Coordinate shared spaces & equipment without conflicts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* STRICT ADMIN-ONLY ACTION BUTTONS */}
            {currentUser?.role === 'ADMIN' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateResourceOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Resource</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRegisterUserOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Add Member</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 4 Responsive Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white border border-slate-200 p-2.5 sm:p-4 rounded-xl shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium block">Available Now</span>
              <span className="text-sm sm:text-lg font-bold text-slate-900">{availableNow} / {totalResources}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-2.5 sm:p-4 rounded-xl shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium block">Active Bookings</span>
              <span className="text-sm sm:text-lg font-bold text-slate-900">{activeBookings}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-2.5 sm:p-4 rounded-xl shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex-shrink-0">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium block">In Maintenance</span>
              <span className="text-sm sm:text-lg font-bold text-slate-900">{maintenanceCount}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-2.5 sm:p-4 rounded-xl shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium block">Total Resources</span>
              <span className="text-sm sm:text-lg font-bold text-slate-900">{totalResources}</span>
            </div>
          </div>
        </div>

        {/* Tab View */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 font-medium">Fetching facilities from PostgreSQL...</div>
            <GridSkeleton count={6} />
          </div>
        ) : (
          <>
            {activeTab === 'resources' && (
              <ResourceGrid
                resources={resources}
                onBookResource={handleBookFromCard}
                onRefresh={fetchData}
                onOpenCreateModal={() => setIsCreateResourceOpen(true)}
                onEditResource={(res) => {
                  setResourceToEdit(res);
                  setIsEditResourceOpen(true);
                }}
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleTimeline
                resources={resources}
                reservations={reservations}
                onSlotClick={handleSlotClick}
              />
            )}

            {activeTab === 'my-reservations' && (
              <ReservationList
                reservations={reservations}
                onRefresh={fetchData}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <ReservationModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={fetchData}
        resources={resources}
        preSelectedResourceId={preSelectedResourceId}
        preSelectedDate={preSelectedDate}
        preSelectedHour={preSelectedHour}
      />

      <CreateResourceModal
        isOpen={isCreateResourceOpen}
        onClose={() => setIsCreateResourceOpen(false)}
        onSuccess={fetchData}
      />

      <RegisterUserModal
        isOpen={isRegisterUserOpen}
        onClose={() => setIsRegisterUserOpen(false)}
      />

      <EditResourceModal
        isOpen={isEditResourceOpen}
        onClose={() => {
          setIsEditResourceOpen(false);
          setResourceToEdit(null);
        }}
        onSuccess={fetchData}
        resource={resourceToEdit}
      />

      {/* Dynamic Status Footer */}
      <Footer isDatabaseConnected={isDbConnected} />
    </div>
  );
}