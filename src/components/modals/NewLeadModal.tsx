"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AddressInput } from '@/components/common/AddressInput';
import { validateAddress, type ValidatedAddress } from '@/utils/addressValidation';

interface NewLeadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NewLeadModal({ onClose, onSuccess }: NewLeadModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    company: '',
    propertyAddress: '',
    serviceType: 'removal',
    urgencyLevel: 'medium',
    leadSource: 'website',
    estimatedTreeCount: 1,
    estimatedProjectValue: '$500-1500',
    notes: '',
  });
  
  const [validatedAddress, setValidatedAddress] = useState<ValidatedAddress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createLead = useMutation(api.leads.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createLead({
        customerName: formData.customerName,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        company: formData.company || undefined,
        propertyAddress: formData.propertyAddress,
        serviceType: formData.serviceType,
        urgencyLevel: formData.urgencyLevel,
        leadSource: formData.leadSource,
        estimatedTreeCount: formData.estimatedTreeCount,
        estimatedProjectValue: formData.estimatedProjectValue,
        notes: formData.notes || undefined,
      });

      onSuccess();
    } catch (error) {
      console.error('Failed to create lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedTreeCount' ? parseInt(value) || 1 : value,
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">New Lead</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Customer Name */}
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

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3">
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

          {/* Company */}
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

          {/* Property Address */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Property Address *
            </label>
            <AddressInput
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

          {/* Service Type and Urgency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Service Type
              </label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              >
                <option value="removal">Tree Removal</option>
                <option value="trimming">Tree Trimming</option>
                <option value="stump_grinding">Stump Grinding</option>
                <option value="emergency">Emergency Service</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Urgency Level
              </label>
              <select
                name="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          {/* Lead Source and Tree Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Lead Source
              </label>
              <select
                name="leadSource"
                value={formData.leadSource}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="google">Google</option>
                <option value="facebook">Facebook</option>
                <option value="phone">Phone Call</option>
                <option value="walk_in">Walk-in</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Est. Tree Count
              </label>
              <input
                type="number"
                name="estimatedTreeCount"
                value={formData.estimatedTreeCount}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>
          </div>

          {/* Project Value */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Estimated Project Value
            </label>
            <select
              name="estimatedProjectValue"
              value={formData.estimatedProjectValue}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option value="$0-500">$0 - $500</option>
              <option value="$500-1500">$500 - $1,500</option>
              <option value="$1500-3000">$1,500 - $3,000</option>
              <option value="$3000+">$3,000+</option>
            </select>
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
              placeholder="Additional notes about the lead..."
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
              {isSubmitting ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}