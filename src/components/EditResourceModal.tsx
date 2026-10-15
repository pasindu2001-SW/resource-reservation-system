'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Resource } from '@/types';
import { ResourceCategory, ResourceStatus } from '@prisma/client';

interface EditResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resource: Resource | null;
}

export function EditResourceModal({
  isOpen,
  onClose,
  onSuccess,
  resource,
}: EditResourceModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>(ResourceCategory.MEETING_ROOM);
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ResourceStatus>(ResourceStatus.AVAILABLE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resource && isOpen) {
      setName(resource.name);
      setCategory(resource.category);
      setLocation(resource.location);
      setCapacity(resource.capacity ?? '');
      setDescription(resource.description ?? '');
      setStatus(resource.status);
      setError(null);
    }
  }, [resource, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource) return;

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          location,
          capacity: capacity ? Number(capacity) : null,
          description: description || null,
          status,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to update resource');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update resource');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Resource: ${resource?.name || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <Input
          label="Resource Name"
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
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Capacity (Seats)"
            type="number"
            min={1}
            placeholder="Optional"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value, 10) : '')}
          />

          <Select
            label="Operational Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ResourceStatus)}
            options={[
              { value: ResourceStatus.AVAILABLE, label: 'Available' },
              { value: ResourceStatus.MAINTENANCE, label: 'Under Maintenance' },
            ]}
          />
        </div>

        <Input
          label="Description / Amenities"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={async () => {
              if (!resource) return;
              if (!confirm(`Are you sure you want to permanently delete "${resource.name}"?`)) return;

              setIsLoading(true);
              setError(null);
              try {
                const res = await fetch(`/api/resources/${resource.id}`, {
                  method: 'DELETE',
                });
                const json = await res.json();
                if (!res.ok) {
                  setError(json.message || 'Failed to delete resource');
                  return;
                }
                onSuccess();
                onClose();
              } catch {
                setError('Failed to delete resource due to a network error.');
              } finally {
                setIsLoading(false);
              }
            }}
          >
            Delete Resource
          </Button>

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}