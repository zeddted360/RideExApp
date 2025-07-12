import AddFoodItemForm from '@/components/AddItemForm'
import React from 'react'

export const metadata = {
  title: "Add Item",
  description: "Add a new food item to the RideEx Food Ordering App menu.",
  openGraph: {
    title: "Add Item | RideEx Food Ordering App",
    description: "Add a new food item to the RideEx Food Ordering App menu.",
    url: "/add-item",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Item | RideEx Food Ordering App",
    description: "Add a new food item to the RideEx Food Ordering App menu.",
  },
};

const AddItemPage = () => {
  return (
    <div>
        <AddFoodItemForm/>
    </div>
  )
}

export default AddItemPage;