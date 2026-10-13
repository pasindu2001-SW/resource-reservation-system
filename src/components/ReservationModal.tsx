'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { useUser } from '@/context/UserContext';
import { Resource } from '@/types';
import { AlertCircle, Clock, Calendar as CalendarIcon, Users } from 'lucide-react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resources: Resource[];
  preSelectedResourceId?: string | null;
  preSelectedDate?: string | null;
  preSelectedHour?: number | null;
}

export function ReservationModal({
  isOpen,
  onClose,
  onSuccess,
  resources,
  preSelectedResourceId,
  preSelectedDate,
  preSelectedHour,
}: ReservationModalProps) {
  const { currentUser } = useUser();

  const [resourceId, setResourceId] = useState('');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [attendeeCount, setAttendeeCount] = useState<number | ''>('');
  
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set default or preselected values whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setConflictError(null);
      setValidationError(null);
      
      const targetResource = preSelectedResourceId
        ? resources.find((r) => r.id === preSelectedResourceId)
        : resources.find((r) => r.status === 'AVAILABLE');

      if (targetResource) {
        setResourceId(targetResource.id);
      }

      // Default date to today or preselected
      const today = new Date().toISOString().split('T')[0];
      setDate(preSelectedDate || today);

      if (preSelectedHour !== undefined && preSelectedHour !== null) {
        const startStr = `${preSelectedHour.toString().padStart(2, '0')}:00`;
        const endStr = `${(preSelectedHour + 1).toString().padStart(2, '0')}:00`;
        setStartTime(startStr);
        setEndTime(endStr);
      } else {
        setStartTime('10:00');
        setEndTime('11:00');
      }
    }
  }, [isOpen, preSelectedResourceId, preSelectedDate, preSelectedHour, resources]);

  const selectedResource = resources.find((r) => r.id === resourceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setValidationError(null);

    if (!currentUser) {
      setValidationError('Please select an active user first.');
      return;
    }

    if (!resourceId) {
      setValidationError('Please select a resource to reserve.');
      return;
    }

    // Build ISO timestamps
    const startIso = new Date(`${date}T${startTime}:00`).toISOString();
    const endIso = new Date(`${date}T${endTime}:00`).toISOString();

    setIsLoading(true);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId,
          userId: currentUser.id,
          title,
          purpose: purpose || null,
          startTime: startIso,
          endTime: endIso,
          attendeeCount: attendeeCount ? Number(attendeeCount) : null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          // Double-booking conflict caught by our backend algorithm!
          setConflictError(json.message);
        } else {
          // Operational validation error (e.g. past time, over capacity)
          setValidationError(json.message);
        }
        return;
      }

      // Success! Reset form and notify parent
      setTitle('');
      setPurpose('');
      setAttendeeCount('');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setValidationError('An unexpected network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableResources = resources.filter((r) => r.status === 'AVAILABLE');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reserve a Shared Resource">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Double-Booking Conflict Alert Box */}
        {conflictError && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-amber-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
            <div className="text-xs">
              <span className="font-bold block text-amber-200">Scheduling Conflict Detected</span>
              <p className="mt-0.5 leading-relaxed">{conflictError}</p>
            </div>
          </div>
        )}

        {/* General Validation Error Box */}
        {validationError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="text-xs">
              <span className="font-bold block text-rose-200">Unable to Reserve</span>
              <p className="mt-0.5 leading-relaxed">{validationError}</p>
            </div>
          </div>
        )}

        {/* Resource Selector */}
        <Select
          label="Select Resource"
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          options={availableResources.map((r) => ({
            value: r.id,
            label: `${r.name} (${r.category.replace('_', ' ')}${r.capacity ? ` · Max ${r.capacity} seats` : ''})`,
          }))}
          required
        />

        {/* Reservation Title */}
        <Input
          label="Reservation Title / Meeting Name"
          placeholder="e.g. Engineering Sprint Planning"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />

          <Input
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <Input
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        {/* Capacity Helper & Attendee Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Expected Attendees"
            type="number"
            min={1}
            max={selectedResource?.capacity || undefined}
            placeholder={selectedResource?.capacity ? `Max ${selectedResource.capacity}` : 'Optional'}
            value={attendeeCount}
            onChange={(e) => setAttendeeCount(e.target.value ? parseInt(e.target.value, 10) : '')}
            helperText={
              selectedResource?.capacity
                ? `Max room limit: ${selectedResource.capacity} seats`
                : 'No seat limit for this resource type'
            }
          />

          <Input
            label="Purpose / Notes (Optional)"
            placeholder="e.g. Projector needed, client presentation"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>

        {/* Active User Reminder */}
        <div className="text-xs text-slate-400 bg-slate-800/50 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
          <span>Reserving on behalf of:</span>
          <span className="font-semibold text-emerald-400">
            {currentUser?.name} ({currentUser?.department})
          </span>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Confirm Reservation
          </Button>
        </div>
      </form>
    </Modal>
  );
}