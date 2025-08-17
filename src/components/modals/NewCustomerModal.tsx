"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SecureAddressInput } from '@/components/common/SecureAddressInput';
import { validateAddress, type ValidatedAddress } from '@/utils/addressValidation';

interface NewCustomerModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NewCustomerModal({ onClose, onSuccess }: NewCustomerModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    company: '',
    propertyAddress: '',
    status: 'active',
    priority: 'medium',
    tags: [] as string[],
    
    // Property Intelligence
    lotSize: '',
    topology: '',
    soilType: '',
    drainage: '',
    accessChallenges: [] as string[],
    
    // Communication Preferences
    contactMethod: 'email',
    bestTimeToCall: '',
    informationStyle: 'standard',
    
    // Financial Intelligence
    spendingTier: 'standard',
    priceSensitivity: 'medium',
    paymentReliability: 'good',
    preferredPaymentMethod: 'check',
    
    // Risk Assessment
    paymentRisk: 'low',
    accessRisk: 'low',
    logisticsComplexity: 'low',
    safetyConsciousness: 'medium',
    
    notes: ''
  });
  
  const [validatedAddress, setValidatedAddress] = useState<ValidatedAddress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [accessChallengeInput, setAccessChallengeInput] = useState('');
  
  const createCustomer = useMutation(api.customers.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Build comprehensive customer intelligence object
      const customerData = {
        // Basic Information
        customerName: formData.customerName,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        company: formData.company || undefined,
        propertyAddress: formData.propertyAddress,
        propertyCoordinates: validatedAddress?.coordinates ? {
          lat: validatedAddress.coordinates.lat,
          lng: validatedAddress.coordinates.lng
        } : undefined,
        
        // Status and Priority
        status: formData.status,
        priority: formData.priority,
        tags: formData.tags,
        
        // Property Intelligence
        propertyIntelligence: {
          lotSize: formData.lotSize || undefined,
          topology: formData.topology || undefined,
          soilType: formData.soilType || undefined,
          drainage: formData.drainage || undefined,
          accessChallenges: formData.accessChallenges,
          utilityLines: {
            overhead: [],
            underground: []
          },
          aerialHistory: []
        },
        
        // Communication Intelligence
        communicationIntelligence: {
          preferences: {
            contactMethod: formData.contactMethod,
            bestTimeToCall: formData.bestTimeToCall || undefined,
            informationStyle: formData.informationStyle
          },
          decisionMaking: {
            speed: 'standard',
            involvedParties: [],
            influenceFactors: [],
            trustBuilders: []
          }
        },
        
        // Financial Intelligence
        financialIntelligence: {
          spendingCapacity: {
            spendingTier: formData.spendingTier,
            priceSensitivity: formData.priceSensitivity
          },
          paymentPatterns: {
            paymentReliability: formData.paymentReliability,
            preferredPaymentMethod: formData.preferredPaymentMethod,
            averagePayTime: 14
          },
          referralValue: {
            customersReferred: 0,
            referralRevenue: 0,
            influenceScore: 5.0
          }
        },
        
        // Risk Assessment
        riskAssessment: {
          paymentRisk: formData.paymentRisk,
          accessRisk: formData.accessRisk,
          logisticsComplexity: formData.logisticsComplexity,
          customerBehavior: {
            safetyConsciousness: formData.safetyConsciousness,
            riskTolerance: 'medium',
            supervision: 'occasionally present'
          },
          liabilityRisks: {
            propertyRisks: [],
            insuranceAdequacy: 'good',
            specialRequirements: []
          }
        },
        
        // Initialize empty systems
        treeInventory: [],
        serviceHistory: [],
        
        // Predictive Intelligence - will be populated by AI over time
        predictiveIntelligence: {
          seasonalCycle: {
            spring: ['pruning', 'fertilization'],
            summer: ['pest treatment'],
            fall: ['cleanup', 'storm prep'],
            winter: ['removals', 'major work']
          },
          budgetCycle: {
            peakSpendingMonths: ['March', 'October'],
            averageAnnualSpend: 1500,
            largeProjectTiming: 'spring'
          }
        },
        
        // Relationship Mapping
        relationshipMapping: {
          familyConnections: [],
          neighborConnections: [],
          referralNetwork: [],
          communityInvolvement: {
            hoa: false,
            localInfluence: 'low',
            reputationMatters: true
          }
        },
        
        // AI Insights - will be populated over time
        aiInsights: {
          retentionRisk: 'low',
          lifetimeValue: 2000,
          upsellOpportunities: [],
          smartAlerts: []
        },
        
        // Evolution Tracking
        evolutionTracking: {
          landscapeChanges: [],
          infrastructureUpdates: [],
          neighborhoodDevelopment: {
            newConstruction: 'minimal',
            treeRemovalTrends: 'stable',
            serviceOpportunities: 'medium'
          }
        },
        
        // System fields
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };

      await createCustomer(customerData as any);
      onSuccess();
    } catch (error) {
      console.error('Failed to create customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (address: string, place?: any) => {
    setFormData(prev => ({ ...prev, propertyAddress: address }));
    
    if (place) {
      const validated = validateAddress(place);
      setValidatedAddress(validated);
    } else {
      setValidatedAddress(null);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addAccessChallenge = () => {
    if (accessChallengeInput.trim() && !formData.accessChallenges.includes(accessChallengeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        accessChallenges: [...prev.accessChallenges, accessChallengeInput.trim()]
      }));
      setAccessChallengeInput('');
    }
  };

  const removeAccessChallenge = (challengeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      accessChallenges: prev.accessChallenges.filter(challenge => challenge !== challengeToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">New Customer Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  placeholder="Company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Property Address *
              </label>
              <SecureAddressInput
                value={formData.propertyAddress}
                onChange={handleAddressChange}
                placeholder="Start typing address..."
                required
              />
              {validatedAddress && validatedAddress.confidence && (
                <div className="mt-1 flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    validatedAddress.confidence === 'high' ? 'bg-green-500' : 
                    validatedAddress.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-muted-foreground">
                    Address validation: {validatedAddress.confidence}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="active">Active</option>
                  <option value="prospective">Prospective</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Property Intelligence */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Property Intelligence</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Lot Size
                </label>
                <input
                  type="text"
                  name="lotSize"
                  value={formData.lotSize}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  placeholder="0.5 acres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Topology
                </label>
                <select
                  name="topology"
                  value={formData.topology}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="">Select topology</option>
                  <option value="flat">Flat</option>
                  <option value="sloped">Sloped</option>
                  <option value="steep">Steep</option>
                  <option value="irregular">Irregular</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Soil Type
                </label>
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="">Select soil type</option>
                  <option value="clay">Clay</option>
                  <option value="sandy">Sandy</option>
                  <option value="sandy loam">Sandy Loam</option>
                  <option value="rocky">Rocky</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Drainage
                </label>
                <select
                  name="drainage"
                  value={formData.drainage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="">Select drainage</option>
                  <option value="poor">Poor</option>
                  <option value="fair">Fair</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>
            </div>

            {/* Access Challenges */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Access Challenges
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={accessChallengeInput}
                  onChange={(e) => setAccessChallengeInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  placeholder="e.g., narrow gate, steep driveway"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAccessChallenge())}
                />
                <button
                  type="button"
                  onClick={addAccessChallenge}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.accessChallenges.map((challenge, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-muted text-foreground text-sm rounded-full"
                  >
                    {challenge}
                    <button
                      type="button"
                      onClick={() => removeAccessChallenge(challenge)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Communication & Financial Intelligence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Communication Intelligence */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Communication Preferences</h3>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Preferred Contact Method
                </label>
                <select
                  name="contactMethod"
                  value={formData.contactMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="email">Email</option>
                  <option value="call">Phone Call</option>
                  <option value="text">Text Message</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Best Time to Call
                </label>
                <input
                  type="text"
                  name="bestTimeToCall"
                  value={formData.bestTimeToCall}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  placeholder="e.g., weekday evenings"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Information Style
                </label>
                <select
                  name="informationStyle"
                  value={formData.informationStyle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="summary">Summary</option>
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>

            {/* Financial Intelligence */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Financial Profile</h3>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Spending Tier
                </label>
                <select
                  name="spendingTier"
                  value={formData.spendingTier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="budget">Budget</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Price Sensitivity
                </label>
                <select
                  name="priceSensitivity"
                  value={formData.priceSensitivity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Payment Reliability
                </label>
                <select
                  name="paymentReliability"
                  value={formData.paymentReliability}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="poor">Poor</option>
                  <option value="fair">Fair</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Tags
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                placeholder="Add tags (e.g., pool, HOA, senior)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-primary/70 hover:text-primary"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
              placeholder="Additional notes about the customer..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Customer...' : 'Create Customer Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}