import React from 'react'
import MyAddresses from '@/components/MyAddresses'

export const metadata = {
  title: 'My Addresses | Food Ordering App',
  description: 'Manage your delivery addresses for faster and more convenient food orders.',
  openGraph: {
    title: 'My Addresses | Food Ordering App',
    description: 'Manage your delivery addresses for faster and more convenient food orders.',
    url: '/address',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Addresses | Food Ordering App',
    description: 'Manage your delivery addresses for faster and more convenient food orders.',
  },
};

const page = () => {
  return <MyAddresses />
}

export default page