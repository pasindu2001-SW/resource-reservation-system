'use client';

import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { ResourceCategory } from '@prisma/client';

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateResourceModal({ isOpen, onClose, onSuccess }: CreateResourceModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>(ResourceCategory.MEETING_ROOM);
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          location,
          capacity: capacity ? Number(capacity) : null,
          description: description || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to create resource');
      }

      setName('');
      setLocation('');
      setCapacity('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create resource');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Shared Resource">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <Input
          label="Resource Name"
          placeholder="e.g. Design Studio A or Conference Mic Kit"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ResourceCategory)}
            options={[
              { value: ResourceCategory.MEETING_ROOM, label: 'Meeting Room' },
              { value: ResourceCategory.EQUIPMENT, label: 'Equipment & AV' },
              { value: ResourceCategory.VEHICLE, label: 'Vehicle' },
              { value: ResourceCategory.WORKSPACE, label: 'Dedicated Workspace' },
            ]}
          />

          <Input
            label="Location"
            placeholder="e.g. Floor 2 - Room 204"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <Input
          label="Capacity (Seats / People)"
          type="number"
          min={1}
          placeholder="Leave blank for devices or equipment"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value, 10) : '')}
          helperText="Applies to rooms and vehicles. Leave empty for portable equipment."
        />

        <Input
          label="Description / Amenities"
          placeholder="e.g. 4K TV, HDMI Cable, Whiteboard, 8 Chairs"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create Resource
          </Button>
        </div>
      </form>
    </Modal>
  );
}