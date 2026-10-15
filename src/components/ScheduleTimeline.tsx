'use client';

import React, { useState, useEffect } from 'react';
import { Resource, Reservation } from '@/types';
import { ChevronLeft, ChevronRight, Clock, Plus, Moon, Sun } from 'lucide-react';
import { Button } from './ui/Button';

interface ScheduleTimelineProps {
  resources: Resource[];
  reservations: Reservation[];
  onSlotClick: (resourceId: string, dateStr: string, hour: number) => void;
}

export function ScheduleTimeline({
  resources,
  reservations,
  onSlotClick,
}: ScheduleTimelineProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [timeViewMode, setTimeViewMode] = useState<'DAY' | 'NIGHT' | 'EXTENDED'>('DAY');

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Define hour ranges
  const dayHours = [
    { hour: 8, label: '8 AM' },
    { hour: 9, label: '9 AM' },
    { hour: 10, label: '10 AM' },
    { hour: 11, label: '11 AM' },
    { hour: 12, label: '12 PM' },
    { hour: 13, label: '1 PM' },
    { hour: 14, label: '2 PM' },
    { hour: 15, label: '3 PM' },
    { hour: 16, label: '4 PM' },
    { hour: 17, label: '5 PM' },
    { hour: 18, label: '6 PM' },
  ];

  const nightHours = [
    { hour: 18, label: '6 PM' },
    { hour: 19, label: '7 PM' },
    { hour: 20, label: '8 PM' },
    { hour: 21, label: '9 PM' },
    { hour: 22, label: '10 PM' },
    { hour: 23, label: '11 PM' },
    { hour: 0, label: '12 AM' },
  ];

  const extendedHours = [
    ...dayHours,
    { hour: 19, label: '7 PM' },
    { hour: 20, label: '8 PM' },
    { hour: 21, label: '9 PM' },
    { hour: 22, label: '10 PM' },
    { hour: 23, label: '11 PM' },
  ];

  const activeSlots =
    timeViewMode === 'DAY'
      ? dayHours
      : timeViewMode === 'NIGHT'
      ? nightHours
      : extendedHours;

  const handleDayShift = (days: number) => {
    if (!selectedDate) return;
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const dayReservations = reservations.filter((res) => {
    if (res.status !== 'CONFIRMED') return false;
    const resDate = new Date(res.startTime).toISOString().split('T')[0];
    return resDate === selectedDate;
  });

  // Check if any booking on this date is in the evening (after 6 PM)
  const hasEveningBookings = dayReservations.some((res) => {
    const h = new Date(res.startTime).getHours();
    return h >= 18;
  });

  const getReservationForSlot = (resourceId: string, hour: number) => {
    return dayReservations.find((res) => {
      if (res.resourceId !== resourceId) return false;
      const start = new Date(res.startTime);
      const end = new Date(res.endTime);

      const slotStart = new Date(start);
      slotStart.setHours(hour, 0, 0, 0);

      const slotEnd = new Date(start);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      return start < slotEnd && end > slotStart;
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
      {/* Header Controls: Date Picker + Time View Switcher */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            Daily Availability Schedule
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any free slot to book. Switch between daytime and evening hours.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTimeViewMode('DAY')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                timeViewMode === 'DAY'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-500" />
              <span>Day (8AM–6PM)</span>
            </button>
            <button
              onClick={() => setTimeViewMode('NIGHT')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                timeViewMode === 'NIGHT'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3 h-3 text-indigo-500" />
              <span>Evening (6PM–12AM)</span>
            </button>
            <button
              onClick={() => setTimeViewMode('EXTENDED')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeViewMode === 'EXTENDED'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Day (7AM–11PM)
            </button>
          </div>

          {/* Date Selector */}
          <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => handleDayShift(-1)}
              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 px-1 py-0.5 focus:outline-none cursor-pointer"
            />

            <button
              onClick={() => handleDayShift(1)}
              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <Button
              size="sm"
              variant="outline"
              className="text-[11px] py-0.5 px-2 h-auto"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            >
              Today
            </Button>
          </div>
        </div>
      </div>

      {/* Helper Banner if evening booking exists while on Day mode */}
      {hasEveningBookings && timeViewMode === 'DAY' && (
        <div className="bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center justify-between text-xs text-indigo-800">
          <span className="flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            Evening bookings are scheduled on this day after 6:00 PM.
          </span>
          <button
            onClick={() => setTimeViewMode('NIGHT')}
            className="text-indigo-600 font-bold hover:underline ml-2"
          >
            View Evening Slots →
          </button>
        </div>
      )}

      {/* The Timeline Table Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[850px]">
          {/* Header Row */}
          <div
            className="grid gap-1 text-[11px] font-semibold text-slate-500 pb-2 border-b border-slate-200"
            style={{
              gridTemplateColumns: `200px repeat(${activeSlots.length}, minmax(60px, 1fr))`,
            }}
          >
            <div className="text-slate-700">Resource</div>
            {activeSlots.map((slot) => (
              <div key={slot.hour} className="text-center font-medium">
                {slot.label}
              </div>
            ))}
          </div>

          {/* Resource Rows */}
          <div className="divide-y divide-slate-100">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="grid gap-1 py-2.5 items-center"
                style={{
                  gridTemplateColumns: `200px repeat(${activeSlots.length}, minmax(60px, 1fr))`,
                }}
              >
                {/* Resource Info */}
                <div className="pr-2">
                  <div className="font-semibold text-xs text-slate-900 truncate">{resource.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {resource.category.toLowerCase().replace('_', ' ')}
                    {resource.capacity && ` · ${resource.capacity} seats`}
                  </div>
                </div>

                {/* Hour Slots */}
                {activeSlots.map((slot) => {
                  const booking = getReservationForSlot(resource.id, slot.hour);
                  const isMaintenance = resource.status === 'MAINTENANCE';

                  if (isMaintenance) {
                    return (
                      <div
                        key={slot.hour}
                        className="h-10 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-[10px] text-amber-700 font-medium"
                      >
                        Maint.
                      </div>
                    );
                  }

                  if (booking) {
                    return (
                      <div
                        key={slot.hour}
                        className="h-10 rounded bg-blue-100 border border-blue-300 p-1 flex flex-col justify-center overflow-hidden"
                        title={`${booking.title} (${booking.user?.name})`}
                      >
                        <span className="text-[10px] font-bold text-blue-900 truncate leading-tight">
                          {booking.title}
                        </span>
                        <span className="text-[9px] text-blue-700 truncate">
                          {booking.user?.name?.split(' ')[0]}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={slot.hour}
                      onClick={() => onSlotClick(resource.id, selectedDate, slot.hour)}
                      className="h-10 rounded bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-center group"
                      title={`Book at ${slot.label}`}
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}