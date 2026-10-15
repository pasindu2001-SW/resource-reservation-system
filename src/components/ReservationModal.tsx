'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { useUser } from '@/context/UserContext';
import { Resource } from '@/types';
import { AlertCircle } from 'lucide-react';

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
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [attendeeCount, setAttendeeCount] = useState<number | ''>('');
  const [minDateString, setMinDateString] = useState('');
  
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set today safely inside useEffect to avoid Next.js 16 prerender error
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setMinDateString(today);
  }, []);

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

      const today = new Date().toISOString().split('T')[0];
      setDate(preSelectedDate || today);

      if (preSelectedHour !== undefined && preSelectedHour !== null) {
        const startH = preSelectedHour.toString().padStart(2, '0');
        const endH = (preSelectedHour + 1).toString().padStart(2, '0');
        setStartTime(`${startH}:00`);
        setEndTime(`${endH}:00`);
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
          setConflictError(json.message);
        } else {
          setValidationError(json.message);
        }
        return;
      }

      setTitle('');
      setPurpose('');
      setAttendeeCount('');
      onSuccess();
      onClose();
    } catch {
      setValidationError('An unexpected network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableResources = resources.filter((r) => r.status === 'AVAILABLE');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reserve a Shared Resource">
      <form onSubmit={handleSubmit} className="space-y-4">
        {conflictError && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Scheduling Conflict Detected</strong>
              <p className="mt-0.5">{conflictError}</p>
            </div>
          </div>
        )}

        {validationError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Unable to Reserve</strong>
              <p className="mt-0.5">{validationError}</p>
            </div>
          </div>
        )}

        <Select
          label="Resource"
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          options={availableResources.map((r) => ({
            value: r.id,
            label: `${r.name} (${r.category.replace('_', ' ')}${r.capacity ? ` · Max ${r.capacity} seats` : ''})`,
          }))}
          required
        />

        <Input
          label="Reservation Title / Meeting Purpose"
          placeholder="e.g. Engineering Team Sync"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={minDateString}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Attendees"
            type="number"
            min={1}
            max={selectedResource?.capacity || undefined}
            placeholder={selectedResource?.capacity ? `Max ${selectedResource.capacity}` : 'Optional'}
            value={attendeeCount}
            onChange={(e) => setAttendeeCount(e.target.value ? parseInt(e.target.value, 10) : '')}
            helperText={selectedResource?.capacity ? `Capacity: ${selectedResource.capacity}` : undefined}
          />

          <Input
            label="Notes (Optional)"
            placeholder="e.g. Need projector cable"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex justify-between">
          <span>Reserving as:</span>
          <span className="font-semibold text-blue-700">
            {currentUser?.name} ({currentUser?.department})
          </span>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
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