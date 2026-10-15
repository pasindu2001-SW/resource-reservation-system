'use client';

import React, { useState } from 'react';
import { Resource } from '@/types';
import { useUser } from '@/context/UserContext';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import {
  Search,
  Users,
  MapPin,
  Calendar,
  Wrench,
  CheckCircle,
  Plus,
  Video,
  Monitor,
  Car,
  Briefcase,
  Edit,
} from 'lucide-react';
import { ResourceCategory, ResourceStatus } from '@prisma/client';

interface ResourceGridProps {
  resources: Resource[];
  onBookResource: (resourceId: string) => void;
  onRefresh: () => void;
  onOpenCreateModal: () => void;
  onEditResource: (resource: Resource) => void;
}

export function ResourceGrid({
  resources,
  onBookResource,
  onRefresh,
  onOpenCreateModal,
  onEditResource,
}: ResourceGridProps) {
  const { currentUser } = useUser();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleMaintenance = async (resource: Resource) => {
    setTogglingId(resource.id);
    const newStatus =
      resource.status === ResourceStatus.AVAILABLE
        ? ResourceStatus.MAINTENANCE
        : ResourceStatus.AVAILABLE;

    try {
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const getCategoryIcon = (category: ResourceCategory) => {
    switch (category) {
      case ResourceCategory.MEETING_ROOM:
        return <Video className="w-4 h-4 text-blue-600" />;
      case ResourceCategory.EQUIPMENT:
        return <Monitor className="w-4 h-4 text-teal-600" />;
      case ResourceCategory.VEHICLE:
        return <Car className="w-4 h-4 text-amber-600" />;
      case ResourceCategory.WORKSPACE:
        return <Briefcase className="w-4 h-4 text-purple-600" />;
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      search === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, location, or amenities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="MEETING_ROOM">Meeting Rooms</option>
            <option value="EQUIPMENT">Equipment & AV</option>
            <option value="VEHICLE">Vehicles</option>
            <option value="WORKSPACE">Workspaces</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          {currentUser?.role === 'ADMIN' && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCreateModal}
              className="flex items-center gap-1 ml-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Resource</span>
            </Button>
          )}
        </div>
      </div>

      {/* Grid or Clean Empty State */}
      {filteredResources.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No resources match your filters"
          description="Try clearing your search keyword, changing the category, or adjusting the status filter."
          action={
            search || selectedCategory !== 'ALL' || statusFilter !== 'ALL' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('ALL');
                  setStatusFilter('ALL');
                }}
              >
                Reset All Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => {
            const isAvailable = resource.status === ResourceStatus.AVAILABLE;
            const isToggling = togglingId === resource.id;

            return (
              <div
                key={resource.id}
                className={`bg-white border rounded-xl p-4 flex flex-col justify-between transition-all hover:border-blue-300 shadow-xs ${
                  !isAvailable ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded bg-slate-50 border border-slate-100 flex-shrink-0">
                        {getCategoryIcon(resource.category)}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                        {resource.category.replace('_', ' ')}
                      </span>
                    </div>

                    <Badge
                      variant={isAvailable ? 'success' : 'warning'}
                      className="whitespace-nowrap flex-shrink-0"
                    >
                      {isAvailable ? 'Available' : 'Maintenance'}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                    {resource.name}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-2.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {resource.location}
                    </span>
                    {resource.capacity && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {resource.capacity} seats
                      </span>
                    )}
                  </div>

                  {resource.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 bg-slate-50 p-2 rounded border border-slate-100">
                      {resource.description}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {currentUser?.role === 'ADMIN' ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleMaintenance(resource)}
                        disabled={isToggling}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <Wrench className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isToggling ? 'Updating...' : isAvailable ? 'Mark Maintenance' : 'Mark Available'}</span>
                      </button>

                      <button
                        onClick={() => onEditResource(resource)}
                        className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-500" />
                        <span>Edit</span>
                      </button>
                    </div>
                  ) : (
                    <div />
                  )}

                  <Button
                    variant={isAvailable ? 'primary' : 'outline'}
                    size="sm"
                    disabled={!isAvailable}
                    onClick={() => onBookResource(resource.id)}
                    className="ml-auto flex-shrink-0"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {isAvailable ? 'Book' : 'Unavailable'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}