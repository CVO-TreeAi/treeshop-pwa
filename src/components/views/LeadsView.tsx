"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { LeadCard } from '@/components/cards/LeadCard';
import { NewLeadModal } from '@/components/modals/NewLeadModal';

export function LeadsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);

  const leads = useQuery(api.leads.list) || [];
  
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus && lead.isActive !== false;
  });

  const statusCounts = leads.reduce((counts, lead) => {
    if (lead.isActive !== false) {
      counts[lead.status] = (counts[lead.status] || 0) + 1;
    }
    return counts;
  }, {} as Record<string, number>);

  const statusOptions = [
    { value: 'all', label: 'All Leads', count: leads.filter(l => l.isActive !== false).length },
    { value: 'new', label: 'New', count: statusCounts.new || 0 },
    { value: 'contacted', label: 'Contacted', count: statusCounts.contacted || 0 },
    { value: 'qualified', label: 'Qualified', count: statusCounts.qualified || 0 },
    { value: 'proposal_sent', label: 'Proposal Sent', count: statusCounts.proposal_sent || 0 },
    { value: 'won', label: 'Won', count: statusCounts.won || 0 },
    { value: 'lost', label: 'Lost', count: statusCounts.lost || 0 },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Lead Management</h2>
          <button
            onClick={() => setShowNewLeadModal(true)}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>New Lead</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search leads by name, address, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' ? 'No leads match your filters' : 'No leads yet'}
            </div>
            <button
              onClick={() => setShowNewLeadModal(true)}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Your First Lead
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeads.map((lead) => (
              <LeadCard key={lead._id} lead={lead} />
            ))}
          </div>
        )}
      </div>

      {/* New Lead Modal */}
      {showNewLeadModal && (
        <NewLeadModal
          onClose={() => setShowNewLeadModal(false)}
          onSuccess={() => setShowNewLeadModal(false)}
        />
      )}
    </div>
  );
}