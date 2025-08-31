// app/page.tsx
import VendorRegistrationForm from '@/components/ui/VendorRegistrationForm';
import React from 'react';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-950 dark:to-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header - Server Rendered */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
            Empower Your Business with
          </h1>
          <h2 className="text-5xl font-bold text-blue-600 mb-6">RideEx</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-xl mx-auto">
            Join our network to streamline your logistics and expand your reach. Register today to manage your deliveries, 
            customize your vendor page, and directly connect with your customers like never before.
          </p>
        </div>

        {/* Client Component for the Form */}
        <VendorRegistrationForm />
      </div>
    </div>
  );
}