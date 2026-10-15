'use client';

import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Role } from '@prisma/client';

interface RegisterUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterUserModal({ isOpen, onClose }: RegisterUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [role, setRole] = useState<Role>(Role.MEMBER);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, department, role }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to register user');
      }

      setName('');
      setEmail('');
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Organization Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          placeholder="e.g. John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Work Email"
          type="email"
          placeholder="e.g. john.doe@org.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Select
          label="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          options={[
            { value: 'Engineering', label: 'Engineering' },
            { value: 'Product', label: 'Product & Design' },
            { value: 'Operations', label: 'Operations & Facilities' },
            { value: 'Marketing', label: 'Marketing & Sales' },
            { value: 'HR', label: 'Human Resources' },
          ]}
        />

        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          options={[
            { value: Role.MEMBER, label: 'Member (Can Reserve Resources)' },
            { value: Role.ADMIN, label: 'Admin (Can Manage & Maintain Resources)' },
          ]}
        />

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}