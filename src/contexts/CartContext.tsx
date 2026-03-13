import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/data/products";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export interface CartItem extends Product {
  quantity: number;
  cart_item_id?: string; // Supabase cart item ID
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [localCart, setLocalCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("second-soul-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load cart items from Supabase or localStorage
  useEffect(() => {
    loadCart();
  }, [user]);

  const loadCart = async () => {
    if (!user) {
      // For guests, use localStorage
      setCartItems(localCart);
      setLoading(false);
      return;
    }

    // For authenticated users, load from Supabase
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        products (
          id,
          name,
          description,
          price,
          size,
          condition,
          category,
          fabric,
          image_url,
          is_new,
          available
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading cart:", error);
      toast.error("Failed to load cart");
      setCartItems(localCart);
      setLoading(false);
      return;
    }

    // Convert Supabase data to CartItem format
    const supabaseCartItems = data.map(item => ({
      ...(item.products as any),
      id: (item.products as any).id,
      image: (item.products as any).image_url,
      cart_item_id: item.id,
      quantity: item.quantity
    }));

    setCartItems(supabaseCartItems);
    
    // If user just signed in and had local cart items, merge them
    if (localCart.length > 0) {
      await mergeLocalCart();
    }
    
    setLoading(false);
  };

  const mergeLocalCart = async () => {
    if (!user || localCart.length === 0) return;

    // Add local cart items to Supabase
    for (const item of localCart) {
      await addToCart(item);
    }

    // Clear local cart
    setLocalCart([]);
    localStorage.removeItem("second-soul-cart");
  };

  const addToCart = async (product: Product) => {
    if (!user) {
      // For guests, use localStorage
      setLocalCart(prev => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          toast.success(`Increased ${product.name} quantity in cart`);
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        toast.success(`Added ${product.name} to cart`);
        return [...prev, { ...product, quantity: 1 }];
      });
      return;
    }

    // For authenticated users, add to Supabase
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // Update quantity
      await updateQuantity(product.id, existingItem.quantity + 1);
      toast.success(`Increased ${product.name} quantity in cart`);
      return;
    }

    // Add new item
    const { data, error } = await supabase
      .from("cart_items")
      .insert([
        {
          user_id: user.id,
          product_id: product.id,
          quantity: 1
        }
      ])
      .select();

    if (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
      return;
    }

    const newItem = {
      ...product,
      cart_item_id: data[0].id,
      quantity: 1
    };

    setCartItems(prev => [...prev, newItem]);
    toast.success(`Added ${product.name} to cart`);
  };

  const removeFromCart = async (productId: string) => {
    if (!user) {
      // For guests, use localStorage
      setLocalCart(prev => prev.filter((item) => item.id !== productId));
      toast.info("Item removed from cart");
      return;
    }

    // For authenticated users, remove from Supabase
    const itemToRemove = cartItems.find(item => item.id === productId);
    
    if (!itemToRemove || !itemToRemove.cart_item_id) {
      toast.error("Item not found in cart");
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemToRemove.cart_item_id);

    if (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item from cart");
      return;
    }

    setCartItems(prev => prev.filter((item) => item.id !== productId));
    toast.info("Item removed from cart");
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (!user) {
      // For guests, use localStorage
      setLocalCart(prev =>
        prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
      );
      return;
    }

    // For authenticated users, update in Supabase
    const itemToUpdate = cartItems.find(item => item.id === productId);
    
    if (!itemToUpdate || !itemToUpdate.cart_item_id) {
      toast.error("Item not found in cart");
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemToUpdate.cart_item_id);

    if (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
      return;
    }

    setCartItems(prev =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = async () => {
    if (!user) {
      // For guests, use localStorage
      setLocalCart([]);
      localStorage.removeItem("second-soul-cart");
      toast.info("Cart cleared");
      return;
    }

    // For authenticated users, clear Supabase cart
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
      return;
    }

    setCartItems([]);
    toast.info("Cart cleared");
  };

  // Update localStorage when localCart changes
  useEffect(() => {
    if (!user) {
      localStorage.setItem("second-soul-cart", JSON.stringify(localCart));
    }
  }, [localCart, user]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
