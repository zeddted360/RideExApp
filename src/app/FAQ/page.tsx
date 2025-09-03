"use client"
import React from 'react';
import { useRouter } from 'next/navigation';

const FAQPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300/10 via-red-300/10 to-pink-300/10 dark:from-orange-500/15 dark:via-red-500/15 dark:to-pink-500/15"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[length:25px_25px]"></div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-gray-200/10 dark:border-white/10 relative z-10">
        <button
          className="p-2 rounded-full bg-gray-900/10 dark:bg-white/10 hover:bg-orange-400/20 dark:hover:bg-orange-500/20 transition-all duration-300 flex items-center justify-center"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-orange-600 dark:text-orange-400 group-hover:text-red-600 dark:group-hover:text-red-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 dark:from-orange-400 to-red-600 dark:to-red-500 bg-clip-text text-transparent animate-pulse-slow">
          FAQ
        </h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Introduction */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-7">
              Find answers to common questions about RideEx, your Moto freight and logistics solution. If you need further assistance, contact us at{' '}
              <a href="mailto:support@rideex.com" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">
                support@rideex.com
              </a>{' '}
              or{' '}
              <a href="tel:+2348012345678" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">
                +234 801 234 5678
              </a>
              .
            </p>
          </div>

          {/* FAQ Sections */}
          {[
            {
              question: 'What services does RideEx offer?',
              answer: 'RideEx is a Moto freight and logistics company that connects users with restaurants, fruit, grocery and supermarket, pharmacy, and health services. We facilitate ordering, delivery, and logistics through our mobile application and motorcycle network.',
            },
            {
              question: 'How fast is the delivery?',
              answer: 'Delivery times are estimates and may vary based on location, weather, and preparation time. Our efficient motorcycle network aims to provide quick service, typically within 30-60 minutes in urban areas.',
            },
            {
              question: 'How can I place an order?',
              answer: 'You can place an order through our mobile application. Simply download the app, sign up, browse available services, and follow the checkout process.',
            },
            {
              question: 'What payment methods are accepted?',
              answer: 'We accept various payment methods available on the platform, including mobile money, credit/debit cards, and cash on delivery (where applicable). Check the app for specific options.',
            },
            {
              question: 'Can I cancel my order?',
              answer: 'Yes, orders can be cancelled within a limited time frame after placement. Refund policies vary by service provider; please refer to our refund policy in the app for details.',
            },
            {
              question: 'Is my personal information secure?',
              answer: 'Yes, we are committed to protecting your privacy. Review our <a href="/privacy" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">Privacy Policy</a> to learn how we collect, use, and protect your data.',
            },
            {
              question: 'How can I contact customer support?',
              answer: 'You can reach us via email at <a href="mailto:support@rideex.com" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">support@rideex.com</a> or by phone at <a href="tel:+2348012345678" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">+234 801 234 5678</a>. Support is also available through the app.',
            },
          ].map((faq, index) => (
            <div key={index} className="my-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
                {faq.question}
              </h2>
              <div
                className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </div>
          ))}

          <div className="mt-12 pt-6 border-t border-gray-200/10 dark:border-white/10 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-2">
              Last updated: September 2025
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              © 2025 RideEx. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQPage;