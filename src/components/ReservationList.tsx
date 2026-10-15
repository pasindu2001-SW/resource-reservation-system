'use client';

import React, { useState } from 'react';
import { Reservation } from '@/types';
import { useUser } from '@/context/UserContext';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Calendar, Clock, User, X } from 'lucide-react';
import { ReservationStatus } from '@prisma/client';
import { EmptyState } from './ui/EmptyState';

interface ReservationListProps {
  reservations: Reservation[];
  onRefresh: () => void;
}

export function ReservationList({ reservations, onRefresh }: ReservationListProps) {
  const { currentUser } = useUser();
  const [filterMode, setFilterMode] = useState<'ALL' | 'MY'>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this reservation? The slot will immediately become free for others.')) {
      return;
    }

    setCancellingId(id);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL' }),
      });

      if (res.ok) onRefresh();
    } catch (err) {
      console.error('Failed to cancel:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (filterMode === 'MY') {
      return r.userId === currentUser?.id;
    }
    return true;
  });

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            Reservations Directory
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and manage bookings across teams.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              filterMode === 'ALL'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({reservations.length})
          </button>
          <button
            onClick={() => setFilterMode('MY')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              filterMode === 'MY'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Bookings ({reservations.filter((r) => r.userId === currentUser?.id).length})
          </button>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={filterMode === 'MY' ? "You don't have any bookings yet" : 'No reservations found'}
          description={
            filterMode === 'MY'
              ? 'You have not reserved any meeting rooms, equipment, or vehicles. Click "Book Slot" to make your first reservation.'
              : 'There are no active or past bookings in the organization schedule.'
          }
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredReservations.map((res) => {
            const start = formatDateTime(res.startTime);
            const end = formatDateTime(res.endTime);
            const isConfirmed = res.status === ReservationStatus.CONFIRMED;
            const canCancel = currentUser?.id === res.userId || currentUser?.role === 'ADMIN';

            return (
              <div
                key={res.id}
                className={`py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                  !isConfirmed ? 'opacity-50' : ''
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{res.title}</span>
                    <Badge variant={isConfirmed ? 'success' : 'danger'}>
                      {isConfirmed ? 'Confirmed' : 'Cancelled'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="text-slate-700 font-medium">{res.resource?.name}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {start.date} · {start.time} – {end.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {res.user?.name} ({res.user?.department})
                    </span>
                  </div>
                </div>

                {isConfirmed && canCancel && (
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={cancellingId === res.id}
                    onClick={() => handleCancel(res.id)}
                    className="text-xs py-1 px-2.5 h-auto"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}