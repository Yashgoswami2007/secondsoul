import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";

export interface Product {
  id: string;
  name: string;
  image: string;
  size: string;
  condition: number;
  price: number;
  category: string;
  isNew?: boolean;
  description?: string;
  fabric?: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Vintage Nike Hoodie",
    image: product1,
    size: "M",
    condition: 9,
    price: 899,
    category: "streetwear",
    isNew: true,
    description: "Authentic vintage Nike hoodie in excellent condition. Perfect oversized fit with classic swoosh logo.",
    fabric: "Cotton blend",
  },
  {
    id: "2",
    name: "Retro Denim Jacket",
    image: product2,
    size: "L",
    condition: 8,
    price: 1299,
    category: "vintage",
    description: "Classic oversized denim jacket with a lived-in wash. Timeless layering piece.",
    fabric: "100% Cotton Denim",
  },
  {
    id: "3",
    name: "Graphic Camp Tee",
    image: product3,
    size: "S",
    condition: 9,
    price: 499,
    category: "vintage",
    isNew: true,
    description: "Rare vintage graphic tee with retro print. Soft, broken-in feel.",
    fabric: "100% Cotton",
  },
  {
    id: "4",
    name: "Corduroy Wide Trousers",
    image: product4,
    size: "M",
    condition: 8,
    price: 799,
    category: "vintage",
    description: "Beautiful corduroy wide-leg pants in warm amber. High-waisted vintage cut.",
    fabric: "Cotton Corduroy",
  },
  {
    id: "5",
    name: "Retro Skate Sneakers",
    image: product5,
    size: "42",
    condition: 7,
    price: 649,
    category: "accessories",
    description: "Worn-in retro skate shoes with gum sole. Full of character.",
    fabric: "Leather & Suede",
  },
  {
    id: "6",
    name: "Leather Crossbody Bag",
    image: product6,
    size: "One Size",
    condition: 9,
    price: 1499,
    category: "accessories",
    isNew: true,
    description: "Beautiful vintage leather crossbody bag with brass hardware. Gorgeous patina.",
    fabric: "Genuine Leather",
  },
  {
    id: "7",
    name: "Wool Turtleneck Sweater",
    image: product7,
    size: "L",
    condition: 9,
    price: 999,
    category: "vintage",
    description: "Chunky wool turtleneck in warm camel. Incredibly cozy and perfectly oversized.",
    fabric: "Wool blend",
  },
  {
    id: "8",
    name: "Plaid Flannel Stack",
    image: product8,
    size: "M",
    condition: 8,
    price: 599,
    category: "streetwear",
    description: "Classic plaid flannel shirt in muted tones. Essential layering piece.",
    fabric: "Cotton Flannel",
  },
];
