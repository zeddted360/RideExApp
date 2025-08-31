import AddFoodItemForm from "@/components/AddItemForm";
import { cookies } from "next/headers";

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

const AddItemPage = async () => {
  const cookie = (await cookies()).getAll();

  return (
    <div className="py-8 px-4 flex justify-center items-start">
      <div className="w-full max-w-2xl">
        <AddFoodItemForm />
      </div>
    </div>
  );
};

export default AddItemPage;
