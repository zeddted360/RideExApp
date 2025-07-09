import HomeClient from '@/components/Home'
import CartDrawer from "@/components/ui/CartDrawer";
import React from 'react'

const HomePage = () => {
  return (
    <>
      <HomeClient />
      <CartDrawer />
    </>
  );
}

export default HomePage