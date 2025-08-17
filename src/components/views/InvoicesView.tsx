"use client";

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { PlusIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export function InvoicesView() {
  const [statusFilter, setStatusFilter] = useState('all');
  
  const invoices = useQuery(api.invoices.list) || [];
  
  const filteredInvoices = invoices.filter((invoice) => {
    return statusFilter === 'all' || invoice.paymentStatus === statusFilter;
  });

  const statusCounts = invoices.reduce((counts, invoice) => {
    counts[invoice.paymentStatus] = (counts[invoice.paymentStatus] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const totals = invoices.reduce((acc, invoice) => {
    acc.total += invoice.totalAmount;
    acc.paid += invoice.amountPaid || 0;
    acc.outstanding += invoice.balance || 0;
    return acc;
  }, { total: 0, paid: 0, outstanding: 0 });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Invoices</h2>
          <button className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span>New Invoice</span>
          </button>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-muted rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Total Invoiced</div>
            <div className="text-lg font-semibold text-foreground">{formatCurrency(totals.total)}</div>
          </div>
          <div className="bg-success/10 rounded-lg p-3">
            <div className="text-sm text-success">Paid</div>
            <div className="text-lg font-semibold text-success">{formatCurrency(totals.paid)}</div>
          </div>
          <div className="bg-warning/10 rounded-lg p-3">
            <div className="text-sm text-warning">Outstanding</div>
            <div className="text-lg font-semibold text-warning">{formatCurrency(totals.outstanding)}</div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All', count: invoices.length },
            { value: 'pending', label: 'Pending', count: statusCounts.pending || 0 },
            { value: 'partial', label: 'Partial', count: statusCounts.partial || 0 },
            { value: 'paid', label: 'Paid', count: statusCounts.paid || 0 },
            { value: 'overdue', label: 'Overdue', count: statusCounts.overdue || 0 },
          ].map((option) => (
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

      {/* Invoices List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground mb-4">No invoices found</div>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Create First Invoice
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div key={invoice._id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-foreground">{invoice.invoiceNumber}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.paymentStatus === 'paid' ? 'bg-success/10 text-success' :
                      invoice.paymentStatus === 'partial' ? 'bg-warning/10 text-warning' :
                      invoice.paymentStatus === 'overdue' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {invoice.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{formatCurrency(invoice.totalAmount)}</div>
                    {invoice.balance && invoice.balance > 0 && (
                      <div className="text-sm text-warning">Balance: {formatCurrency(invoice.balance)}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Customer:</span> {invoice.customerName}
                  </div>
                  <div>
                    <span className="font-medium">Due:</span> {formatDate(invoice.dueDate)}
                  </div>
                </div>

                {invoice.lineItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-sm">
                      <span className="font-medium">Services:</span>
                      <ul className="mt-1 space-y-1">
                        {invoice.lineItems.slice(0, 2).map((item, index) => (
                          <li key={index} className="text-muted-foreground">
                            • {item.description} - {formatCurrency(item.totalPrice)}
                          </li>
                        ))}
                        {invoice.lineItems.length > 2 && (
                          <li className="text-muted-foreground">
                            • +{invoice.lineItems.length - 2} more items
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}