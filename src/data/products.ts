import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";

// Men's new arrivals
import m1 from "@/assets/m (1).jpg";
import m2 from "@/assets/m (2).jpg";
import m3 from "@/assets/m (3).jpg";
import m4 from "@/assets/m (4).jpg";
import m5 from "@/assets/m (5).jpg";
import m6 from "@/assets/m (6).jpg";
import m7 from "@/assets/m (7).jpg";
import m8 from "@/assets/m (8).jpg";

// Women's new arrivals
import f1 from "@/assets/f (1).jpg";
import f2 from "@/assets/f (2).jpg";
import f3 from "@/assets/f (3).jpg";
import f4 from "@/assets/f (4).jpg";
import f5 from "@/assets/f (5).jpg";
import f6 from "@/assets/f(6).jpg";

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
  // Men
  {
    id: "m1",
    name: "Essential Oversized Tee",
    image: m1,
    size: "L",
    condition: 9,
    price: 649,
    category: "men",
    isNew: true,
    description: "Heavyweight drop-shoulder tee. A staple for everyday wear.",
    fabric: "100% Cotton",
  },
  {
    id: "m2",
    name: "Classic Bomber Jacket",
    image: m2,
    size: "XL",
    condition: 8,
    price: 1899,
    category: "men",
    description: "Vintage military-style bomber with orange inner lining.",
    fabric: "Nylon shell",
  },
  {
    id: "m3",
    name: "Tech Cargo Pants",
    image: m3,
    size: "M",
    condition: 9,
    price: 1299,
    category: "men",
    description: "Durable tactical cargos with multiple utility pockets.",
    fabric: "Ripstop Cotton",
  },
  {
    id: "m4",
    name: "Puffer Vest",
    image: m4,
    size: "L",
    condition: 7,
    price: 1099,
    category: "men",
    description: "Lightweight quilted vest for mid-season layering.",
    fabric: "Polyester blend",
  },
  {
    id: "m5",
    name: "Distressed Grunge Denim",
    image: m5,
    size: "M",
    condition: 7,
    price: 1499,
    category: "men",
    description: "Straight-leg jeans with authentic fading and distress.",
    fabric: "100% Cotton",
  },
  {
    id: "m6",
    name: "Heavy Knit Cardigan",
    image: m6,
    size: "XL",
    condition: 9,
    price: 1599,
    category: "men",
    isNew: true,
    description: "Cozy fisherman-style knit. Perfect for chilly evenings.",
    fabric: "Wool blend",
  },
  {
    id: "m7",
    name: "Mock Neck Longsleeve",
    image: m7,
    size: "M",
    condition: 8,
    price: 799,
    category: "men",
    description: "Form-fitting mock neck top. Great base layer piece.",
    fabric: "Cotton-Spandex",
  },
  {
    id: "m8",
    name: "Minimalist Utility Jacket",
    image: m8,
    size: "L",
    condition: 9,
    price: 1999,
    category: "men",
    isNew: true,
    description: "Clean aesthetic workwear jacket with concealed buttons.",
    fabric: "Cotton canvas",
  },
  // Women
  {
    id: "f1",
    name: "Ribbed Midi Dress",
    image: f1,
    size: "S",
    condition: 9,
    price: 1299,
    category: "women",
    isNew: true,
    description: "Figure-hugging ribbed dress in a neutral earth tone.",
    fabric: "Viscose blend",
  },
  {
    id: "f2",
    name: "Satin Slip Skirt",
    image: f2,
    size: "M",
    condition: 8,
    price: 899,
    category: "women",
    description: "Elegant midi-length slip skirt. Soft and versatile.",
    fabric: "Silk-feel Polyester",
  },
  {
    id: "f3",
    name: "Cropped Leather Moto",
    image: f3,
    size: "S",
    condition: 8,
    price: 2499,
    category: "women",
    description: "Genuine leather biker jacket with asymmetrical zip.",
    fabric: "100% Leather",
  },
  {
    id: "f4",
    name: "Chunky Chelsea Boots",
    image: f4,
    size: "38",
    condition: 7,
    price: 1899,
    category: "women",
    description: "Platform leather boots with elastic gussets.",
    fabric: "Leather upper",
  },
  {
    id: "f5",
    name: "Lace Trim Cami",
    image: f5,
    size: "XS",
    condition: 9,
    price: 499,
    category: "women",
    isNew: true,
    description: "Delicate vintage-inspired camisole top.",
    fabric: "Cotton blend",
  },
  {
    id: "f6",
    name: "Flared Trousers",
    image: f6,
    size: "S",
    condition: 9,
    price: 1099,
    category: "women",
    description: "High-waisted tailored trousers with a slight flare.",
    fabric: "Polyester-Viscose",
  }
];
