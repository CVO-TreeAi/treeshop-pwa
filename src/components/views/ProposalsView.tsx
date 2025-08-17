"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMockQuery, useMockMutation } from '@/hooks/useMockConvex';
import { 
  DocumentChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  PaperAirplaneIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { AddressDisplay } from '@/components/ui/AddressDisplay';

interface ProposalLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  treeScoreData?: {
    height: number;
    canopyRadius: number;
    dbh: number;
    baseScore: number;
    riskMultiplier: number;
    finalScore: number;
  };
  equipmentRequired: string[];
  laborHours: number;
  complexity: 'low' | 'moderate' | 'high' | 'extreme';
}

interface Proposal {
  _id: string;
  proposalNumber: string;
  leadId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyAddress: string;
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired';
  lineItems: ProposalLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  validUntil: number;
  notes?: string;
  createdAt: number;
  sentAt?: number;
  viewedAt?: number;
  respondedAt?: number;
  alexAIAssessmentId?: string;
}

export function ProposalsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Try Convex first, fallback to mock data
  const convexProposals = useQuery(api.proposals?.list);
  const convexCreateProposal = useMutation(api.proposals?.create);
  const convexSendProposal = useMutation(api.proposals?.send);
  const convexAcceptProposal = useMutation(api.proposals?.accept);
  
  const mockProposals = useMockQuery('proposals:list');
  const mockCreateProposal = useMockMutation('proposals:create');
  const mockSendProposal = useMockMutation('proposals:send');
  const mockAcceptProposal = useMockMutation('proposals:accept');
  
  const proposals = (convexProposals || mockProposals || mockProposalsData) as Proposal[];
  const createProposal = convexCreateProposal || mockCreateProposal;
  const sendProposal = convexSendProposal || mockSendProposal;
  const acceptProposal = convexAcceptProposal || mockAcceptProposal;

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch = proposal.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.proposalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || proposal.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === 'draft').length,
    sent: proposals.filter(p => p.status === 'sent').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    rejected: proposals.filter(p => p.status === 'rejected').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'sent': return 'bg-info/10 text-info';
      case 'viewed': return 'bg-warning/10 text-warning';
      case 'approved': return 'bg-success/10 text-success';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      case 'expired': return 'bg-secondary/10 text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return DocumentChartBarIcon;
      case 'sent': return PaperAirplaneIcon;
      case 'viewed': return EyeIcon;
      case 'approved': return CheckCircleIcon;
      case 'rejected': return XCircleIcon;
      case 'expired': return ClockIcon;
      default: return DocumentChartBarIcon;
    }
  };

  const handleSendProposal = async (proposalId: string) => {
    try {
      await sendProposal({ proposalId });
    } catch (error) {
      console.error('Failed to send proposal:', error);
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      await acceptProposal({ proposalId });
      // This will create a work order automatically
    } catch (error) {
      console.error('Failed to accept proposal:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilExpiry = (validUntil: number) => {
    const days = Math.ceil((validUntil - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header & Stats */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Proposals</h2>
            <p className="text-sm text-muted-foreground">
              {statusCounts.total} total • {statusCounts.sent} sent • {statusCounts.approved} approved
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Proposal</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-muted-foreground">{statusCounts.draft}</div>
            <div className="text-xs text-muted-foreground">Drafts</div>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-info">{statusCounts.sent}</div>
            <div className="text-xs text-muted-foreground">Sent</div>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-success">{statusCounts.approved}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-destructive">{statusCounts.rejected}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Proposals List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredProposals.length === 0 ? (
          <div className="text-center py-12">
            <DocumentChartBarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'No proposals match your filters' 
                : 'No proposals created yet'}
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create First Proposal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map((proposal) => {
              const StatusIcon = getStatusIcon(proposal.status);
              const daysUntilExpiry = getDaysUntilExpiry(proposal.validUntil);
              const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
              const isExpired = daysUntilExpiry <= 0;

              return (
                <div key={proposal._id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{proposal.proposalNumber}</h3>
                        <p className="text-sm text-muted-foreground">{proposal.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                        {proposal.status.toUpperCase()}
                      </span>
                      {(isExpiringSoon || isExpired) && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isExpired ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                        }`}>
                          {isExpired ? 'Expired' : `${daysUntilExpiry}d left`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Proposal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
                      <div className="text-xl font-bold text-success">{formatCurrency(proposal.totalAmount)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Line Items</div>
                      <div className="text-lg font-semibold text-foreground">{proposal.lineItems.length} items</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Valid Until</div>
                      <div className="text-sm font-medium text-foreground">{formatDate(proposal.validUntil)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Created</div>
                      <div className="text-sm font-medium text-foreground">{formatDate(proposal.createdAt)}</div>
                    </div>
                  </div>

                  {/* Property Address with GPS Integration */}
                  <div className="mb-4">
                    <AddressDisplay 
                      address={proposal.propertyAddress} 
                      showLabel={true}
                      className="w-full"
                    />
                  </div>

                  {/* Line Items Preview */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-foreground mb-2">Services ({proposal.lineItems.length})</div>
                    <div className="space-y-1">
                      {proposal.lineItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.description}</span>
                          <span className="font-medium text-foreground">{formatCurrency(item.totalPrice)}</span>
                        </div>
                      ))}
                      {proposal.lineItems.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{proposal.lineItems.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedProposal(proposal)}
                      className="flex items-center space-x-1 bg-muted text-muted-foreground px-3 py-1 rounded-lg text-sm hover:bg-muted/80 transition-colors"
                    >
                      <EyeIcon className="w-3 h-3" />
                      <span>View Details</span>
                    </button>
                    
                    {proposal.status === 'draft' && (
                      <>
                        <button className="flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm hover:bg-primary/20 transition-colors">
                          <DocumentDuplicateIcon className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleSendProposal(proposal._id)}
                          className="flex items-center space-x-1 bg-info/10 text-info px-3 py-1 rounded-lg text-sm hover:bg-info/20 transition-colors"
                        >
                          <PaperAirplaneIcon className="w-3 h-3" />
                          <span>Send</span>
                        </button>
                      </>
                    )}
                    
                    {(proposal.status === 'sent' || proposal.status === 'viewed') && (
                      <button 
                        onClick={() => handleAcceptProposal(proposal._id)}
                        className="flex items-center space-x-1 bg-success/10 text-success px-3 py-1 rounded-lg text-sm hover:bg-success/20 transition-colors"
                      >
                        <CheckCircleIcon className="w-3 h-3" />
                        <span>Accept & Create Work Order</span>
                      </button>
                    )}
                    
                    <button className="flex items-center space-x-1 bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-lg text-sm hover:bg-secondary/20 transition-colors">
                      <DocumentDuplicateIcon className="w-3 h-3" />
                      <span>Duplicate</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data for development
const mockProposalsData: Proposal[] = [
  {
    _id: "prop1",
    proposalNumber: "PROP-2024-001",
    leadId: "lead1",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    customerPhone: "(555) 123-4567",
    propertyAddress: "123 Oak Street, Springfield, IL 62701",
    status: "sent",
    lineItems: [
      {
        id: "item1",
        description: "Large Oak Tree Removal (60ft, near power lines)",
        quantity: 1,
        unit: "tree",
        unitPrice: 3200,
        totalPrice: 3200,
        treeScoreData: {
          height: 60,
          canopyRadius: 25,
          dbh: 32,
          baseScore: 3750,
          riskMultiplier: 2.1,
          finalScore: 7875
        },
        equipmentRequired: ["Crane", "Chipper", "Chainsaw"],
        laborHours: 8,
        complexity: "high"
      },
      {
        id: "item2", 
        description: "Stump Grinding (32\" DBH)",
        quantity: 1,
        unit: "stump",
        unitPrice: 450,
        totalPrice: 450,
        equipmentRequired: ["Stump Grinder"],
        laborHours: 2,
        complexity: "low"
      },
      {
        id: "item3",
        description: "Debris Removal and Site Cleanup", 
        quantity: 1,
        unit: "service",
        unitPrice: 350,
        totalPrice: 350,
        equipmentRequired: ["Truck", "Trailer"],
        laborHours: 3,
        complexity: "low"
      }
    ],
    subtotal: 4000,
    taxRate: 0.08,
    taxAmount: 320,
    totalAmount: 4320,
    validUntil: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
    notes: "Project requires ISA Certified Arborist supervision due to power line proximity. Utility coordination included.",
    createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
    sentAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
    alexAIAssessmentId: "assessment1"
  },
  {
    _id: "prop2",
    proposalNumber: "PROP-2024-002", 
    customerName: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    customerPhone: "(555) 987-6543",
    propertyAddress: "456 Pine Avenue, Springfield, IL 62702",
    status: "approved",
    lineItems: [
      {
        id: "item4",
        description: "Maple Tree Trimming (Crown Reduction)",
        quantity: 3,
        unit: "tree",
        unitPrice: 280,
        totalPrice: 840,
        equipmentRequired: ["Bucket Truck", "Chainsaw"],
        laborHours: 6,
        complexity: "moderate"
      }
    ],
    subtotal: 840,
    taxRate: 0.08,
    taxAmount: 67.20,
    totalAmount: 907.20,
    validUntil: Date.now() + (25 * 24 * 60 * 60 * 1000),
    createdAt: Date.now() - (5 * 24 * 60 * 60 * 1000),
    sentAt: Date.now() - (4 * 24 * 60 * 60 * 1000),
    viewedAt: Date.now() - (3 * 24 * 60 * 60 * 1000),
    respondedAt: Date.now() - (1 * 24 * 60 * 60 * 1000)
  }
];