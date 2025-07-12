import "./globals.css";
import { Wrapper } from "@/Providers/Wrapper";

export const metadata = {
  title: {
    default: "RideEx Food Ordering App",
    template: "%s | RideEx Food Ordering App",
  },
  description:
    "Order delicious food from your favorite restaurants. Fast delivery, easy ordering, and great offers await you!",
  openGraph: {
    title: "Food Ordering App",
    description:
      "Order delicious food from your favorite restaurants. Fast delivery, easy ordering, and great offers await you!",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Food Ordering App",
    description:
      "Order delicious food from your favorite restaurants. Fast delivery, easy ordering, and great offers await you!",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Wrapper children={children} />;
}
