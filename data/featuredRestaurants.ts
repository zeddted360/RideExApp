// data/featuredRestaurants.ts
import { IfeaturedRestaurant } from "../types/types";

export const featuredRestaurants: IfeaturedRestaurant[] = [
  {
    id: "dtoms",
    name: "D'TOMS PIZZA & SHARWAMA",
    logo: "/images/pizza-logo.webp",
    rating: 4.6,
    deliveryTime: "20-30 mins",
    category: "Fast Food",
    distance: "2.5 km",
    vegetables: [
      {
        id: 4,
        name: "Veggie Supreme",
        description:
          "Mushrooms, bell peppers, onions, olives, tomatoes, cheese",
        price: "₦8500",
        originalPrice: "₦10500",
        image: "/images/veggie-supreme.webp",
        rating: 4.2,
        cookTime: "20-25 mins",
      },
      {
        id: 7,
        name: "Vegetable Stir Fry",
        description:
          "Fresh mixed vegetables stir-fried in a savory sauce, perfect for a healthy meal.",
        price: "₦2,200",
        image: "/images/vegetable-stir-fry.webp",
        rating: 4.6,
        cookTime: "15-20 mins",
        originalPrice: "₦2,500",
      },
    ],
    nonVegetables: [
      {
        id: 1,
        name: "Something Meaty (Mini)",
        description:
          "Beef, chicken, sausage, chilli pepper, Green pepper, Sliced tomato",
        price: "₦9600",
        originalPrice: "₦12000",
        image: "/images/something-meaty-mini.webp",
        rating: 4.5,
        cookTime: "25-30 mins",
      },
      {
        id: 2,
        name: "Sausage Pizza (Mini)",
        description:
          "Sausage, Green pepper, Sweet corn, onions, Chilli pepper sauce",
        price: "₦9000",
        originalPrice: "₦11000",
        image: "/images/sausage-pizza-mini.webp", // Replaced 🍕
        rating: 4.3,
        cookTime: "20-25 mins",
      },
      {
        id: 3,
        name: "Something Meaty Pizza (Medium)",
        description:
          "Beef, chicken, sausage, chilli pepper, green pepper, sweet corn",
        price: "₦14600",
        originalPrice: "₦17000",
        image: "/images/something-meaty-medium.webp", // Replaced 🍕
        rating: 4.7,
        cookTime: "30-35 mins",
      },
      {
        id: 6,
        name: "Chicken Shawarma",
        description:
          "Tender grilled chicken wrapped in pita bread with garlic sauce, veggies, and a hint of spice.",
        price: "₦1,800",
        image: "/images/chicken-shawarma.webp",
        rating: 4.5,
        cookTime: "15-20 mins",
        originalPrice: "₦2,000",
      },
    ],
  },
  {
    id: "mamas-kitchen",
    name: "Mama's Kitchen",
    logo: "/images/african-logo.webp",
    rating: 4.8,
    deliveryTime: "25-35 mins",
    category: "African",
    distance: "3.0 km",
    vegetables: [
      {
        id: 9,
        name: "Fried Plantain",
        description:
          "Sweet, golden-fried plantain slices, a perfect side or snack.",
        price: "₦1,500",
        image: "/images/fried-plantain.webp",
        rating: 4.4,
        cookTime: "10-15 mins",
        originalPrice: "₦1,800",
      },
      {
        id: 12,
        name: "Efo Riro",
        description:
          "Flavorful spinach stew cooked with peppers, served with your choice of swallow.",
        price: "₦2,400",
        image: "/images/efo-riro.webp",
        rating: 4.7,
        cookTime: "20-25 mins",
        originalPrice: "₦2,700",
      },
    ],
    nonVegetables: [
      {
        id: 1,
        name: "Spicy Jollof Rice",
        description:
          "Vibrant, spicy rice cooked with tomatoes, peppers, and a blend of African spices, served with a side of plantain.",
        price: "₦2,500",
        image: "/images/spicy-jollof-rice.webp",
        rating: 4.9,
        cookTime: "20-25 mins",
        originalPrice: "₦2,800",
      },
      {
        id: 5,
        name: "Pounded Yam & Egusi",
        description:
          "Smooth pounded yam served with a hearty egusi stew made with ground melon seeds and spinach.",
        price: "₦2,700",
        image: "/images/pounded-yam-egusi.webp",
        rating: 4.8,
        cookTime: "25-30 mins",
        originalPrice: "₦3,000",
      },
      {
        id: 10,
        name: "Pepper Soup",
        description:
          "Spicy and aromatic soup with assorted meats, infused with traditional African spices.",
        price: "₦2,300",
        image: "/images/pepper-soup.webp",
        rating: 4.6,
        cookTime: "20-25 mins",
        originalPrice: "₦2,600",
      },
    ],
  },
  {
    id: "jevinik",
    name: "Jevinik Restaurant",
    logo: "/images/jevinik-logo.webp",
    rating: 4.7,
    deliveryTime: "25-35 mins",
    category: "Nigerian",
    distance: "2.8 km",
    vegetables: [
      {
        id: 1,
        name: "Vegetable Soup",
        description:
          "Rich vegetable stew with spinach and traditional spices, served with your choice of swallow.",
        price: "₦2,200",
        image: "/images/vegetable-soup.webp",
        rating: 4.5,
        cookTime: "20-25 mins",
        originalPrice: "₦2,500",
      },
    ],
    nonVegetables: [
      {
        id: 2,
        name: "Ofe:Owerri",
        description:
          "Traditional Owerri soup with assorted meats, fish, and local spices.",
        price: "₦3,000",
        image: "/images/ofe-owerri.webp",
        rating: 4.8,
        cookTime: "25-30 mins",
        originalPrice: "₦3,300",
      },
      {
        id: 3,
        name: "Pounded Yam & Afang",
        description:
          "Smooth pounded yam with flavorful Afang soup made with waterleaf and okazi leaves.",
        price: "₦2,800",
        image: "/images/afang-soup.webp",
        rating: 4.7,
        cookTime: "25-30 mins",
        originalPrice: "₦3,100",
      },
      {
        id: 4,
        name: "Mama's Delight Soup",
        description:
          "Signature soup with assorted meats, stockfish, and a blend of local spices.",
        price: "₦3,200",
        image: "/images/mamas-delight-soup.webp",
        rating: 4.9,
        cookTime: "25-30 mins",
        originalPrice: "₦3,500",
      },
    ],
  },
  {
    id: "the-hive",
    name: "The Hive Owerri",
    logo: "/images/the-hive.webp",
    rating: 4.5,
    deliveryTime: "20-30 mins",
    category: "Fusion",
    distance: "2.0 km",
    vegetables: [
      {
        id: 1,
        name: "Chinese Vegetable Fried Rice",
        description: "Stir-fried rice with mixed vegetables and soy sauce.",
        price: "₦2,500",
        image: "/images/veg-fried-rice.webp",
        rating: 4.4,
        cookTime: "15-20 mins",
        originalPrice: "₦2,800",
      },
    ],
    nonVegetables: [
      {
        id: 2,
        name: "Grilled Chicken",
        description:
          "Juicy chicken breast marinated in herbs and spices, grilled to perfection.",
        price: "₦2,800",
        image: "/images/grilled-chicken.webp",
        rating: 4.8,
        cookTime: "20-25 mins",
        originalPrice: "₦3,100",
      },
      {
        id: 3,
        name: "Suya Chicken Noodles",
        description:
          "Spicy noodles tossed with grilled suya chicken and vegetables.",
        price: "₦2,600",
        image: "/images/suya-noodles.webp",
        rating: 4.6,
        cookTime: "15-20 mins",
        originalPrice: "₦2,900",
      },
    ],
  },
  {
    id: "josephs-pot",
    name: "Joseph's Pot",
    logo: "/images/josephs-pot.webp",
    rating: 4.6,
    deliveryTime: "25-35 mins",
    category: "Nigerian",
    distance: "3.2 km",
    vegetables: [
      {
        id: 1,
        name: "Okro Soup",
        description:
          "Fresh okro stew with vegetables, served with your choice of swallow.",
        price: "₦2,100",
        image: "/images/okro-soup.webp",
        rating: 4.5,
        cookTime: "20-25 mins",
        originalPrice: "₦2,400",
      },
    ],
    nonVegetables: [
      {
        id: 2,
        name: "Ofe:Owerri",
        description:
          "Authentic Owerri soup with assorted meats, fish, and local greens.",
        price: "₦3,000",
        image: "/images/ofe-owerri.webp",
        rating: 4.8,
        cookTime: "25-30 mins",
        originalPrice: "₦3,300",
      },
      {
        id: 3,
        name: "Nkwobi",
        description: "Spicy cow foot dish served in a rich, peppery sauce.",
        price: "₦2,500",
        image: "/images/nkwobi.webp",
        rating: 4.7,
        cookTime: "20-25 mins",
        originalPrice: "₦2,800",
      },
    ],
  },
  {
    id: "kilimanjaro",
    name: "Kilimanjaro Restaurant",
    logo: "/images/kilimanjaro.webp",
    rating: 4.4,
    deliveryTime: "15-25 mins",
    category: "Fast Food",
    distance: "2.3 km",
    vegetables: [
      {
        id: 1,
        name: "Coleslaw",
        description:
          "Creamy salad with cabbage, carrots, and mayonnaise dressing.",
        price: "₦1,200",
        image: "/images/coleslaw.webp",
        rating: 4.3,
        cookTime: "10-15 mins",
        originalPrice: "₦1,500",
      },
    ],
    nonVegetables: [
      {
        id: 2,
        name: "BBQ Wings",
        description:
          "Crispy chicken wings tossed in a smoky BBQ sauce, served with a tangy dip.",
        price: "₦2,600",
        image: "/images/bbq-wings.webp",
        rating: 4.5,
        cookTime: "20-25 mins",
        originalPrice: "₦2,900",
      },
      {
        id: 3,
        name: "Fried Rice & Chicken",
        description:
          "Flavorful fried rice served with grilled chicken and veggies.",
        price: "₦2,400",
        image: "/images/fried-rice-chicken.webp",
        rating: 4.4,
        cookTime: "15-20 mins",
        originalPrice: "₦2,700",
      },
    ],
  },
  {
    id: "satiate",
    name: "Satiate Restaurant",
    logo: "/images/satiate.webp",
    rating: 4.8,
    deliveryTime: "20-30 mins",
    category: "Fine Dining",
    distance: "2.7 km",
    vegetables: [
      {
        id: 1,
        name: "Garden Salad",
        description:
          "Fresh greens with tomatoes, cucumbers, and a light vinaigrette.",
        price: "₦2,000",
        image: "/images/garden-salad.webp",
        rating: 4.4,
        cookTime: "10-15 mins",
        originalPrice: "₦2,300",
      },
    ],
    nonVegetables: [
      {
        id: 2,
        name: "Seafood Okra",
        description:
          "Rich okra stew packed with shrimp, fish, and crab, seasoned with traditional spices.",
        price: "₦3,500",
        image: "/images/seafood-okra.webp",
        rating: 4.6,
        cookTime: "25-30 mins",
        originalPrice: "₦3,800",
      },
      {
        id: 3,
        name: "Grilled Fish Platter",
        description:
          "Freshly grilled fish served with pepper sauce and a side of plantain.",
        price: "₦3,200",
        image: "/images/grilled-fish.webp",
        rating: 4.7,
        cookTime: "20-25 mins",
        originalPrice: "₦3,500",
      },
    ],
  },
  {
    id: "old-english",
    name: "Old English Bar & Grills",
    logo: "/images/old-english.webp",
    rating: 4.5,
    deliveryTime: "20-30 mins",
    category: "Bar & Grill",
    distance: "2.4 km",
    vegetables: [
      {
        id: 1,
        name: "Vegetable Salad",
        description:
          "Mixed greens with avocado, tomatoes, and a tangy dressing.",
        price: "₦2,000",
        image: "/images/vegetable-salad.webp",
        rating: 4.4,
        cookTime: "10-15 mins",
        originalPrice: "₦2,300",
      },
    ],
    nonVegetables: [
      {
        id: 2,
        name: "Beef Suya",
        description:
          "Spicy grilled beef skewers coated with a rich peanut spice mix, a Nigerian street food favorite.",
        price: "₦2,000",
        image: "/images/beef-suya.webp",
        rating: 4.7,
        cookTime: "15-20 mins",
        originalPrice: "₦2,300",
      },
      {
        id: 3,
        name: "Grilled Catfish Pepper Soup",
        description: "Spicy catfish soup with aromatic herbs and local spices.",
        price: "₦2,800",
        image: "/images/catfish-pepper-soup.webp",
        rating: 4.6,
        cookTime: "20-25 mins",
        originalPrice: "₦3,100",
      },
    ],
  },
];
