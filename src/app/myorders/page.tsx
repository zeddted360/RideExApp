import React from 'react'
import MyOrders from '@/components/MyOrders'

export const metadata = {
  title: 'My Orders | Food Ordering App',
  description: 'View and manage your active and past food orders. Track status, reorder, and manage your food delivery history.',
  openGraph: {
    title: 'My Orders | Food Ordering App',
    description: 'View and manage your active and past food orders. Track status, reorder, and manage your food delivery history.',
    url: '/myorders',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Orders | Food Ordering App',
    description: 'View and manage your active and past food orders. Track status, reorder, and manage your food delivery history.',
  },
};

const page = () => {
  return <MyOrders />
}

export default page