'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Customer, Product, Partner, MartechTool, InternalContact } from '@/types';
import { CustomerForm } from './CustomerForm';

interface CustomerEditSlideOutProps {
  customer: Customer | undefined;
  products: Product[];
  partners: Partner[];
  martechTools: MartechTool[];
  internalContacts: InternalContact[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

/**
 * Slide-out panel for editing customers - keeps list visible for context (Nexus/LoopAI style)
 */
export function CustomerEditSlideOut({
  customer,
  products,
  partners,
  martechTools,
  internalContacts,
  isOpen,
  onClose,
  onSave,
}: CustomerEditSlideOutProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-2xl sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-white shadow-2xl z-50 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-customer-title"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 z-10">
          <h2 id="edit-customer-title" className="text-xl font-bold text-gray-900">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <CustomerForm
            customer={customer}
            products={products}
            partners={partners}
            martechTools={martechTools}
            internalContacts={internalContacts}
            onSave={(c) => {
              onSave(c);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </>
  );
}
