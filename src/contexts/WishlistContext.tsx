import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [localWishlist, setLocalWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("second-soul-wishlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load wishlist from Supabase or localStorage
  useEffect(() => {
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    if (!user) {
      // For guests, use localStorage
      setWishlistIds(localWishlist);
      setLoading(false);
      return;
    }

    // For authenticated users, load from Supabase
    setLoading(true);
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("product_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading wishlist:", error);
      toast.error("Failed to load wishlist");
      setWishlistIds(localWishlist);
      setLoading(false);
      return;
    }

    const supabaseWishlistIds = data.map(item => item.product_id);
    setWishlistIds(supabaseWishlistIds);
    
    // If user just signed in and had local wishlist items, merge them
    if (localWishlist.length > 0) {
      await mergeLocalWishlist();
    }
    
    setLoading(false);
  };

  const mergeLocalWishlist = async () => {
    if (!user || localWishlist.length === 0) return;

    // Add local wishlist items to Supabase
    for (const productId of localWishlist) {
      if (!wishlistIds.includes(productId)) {
        await toggleWishlist(productId);
      }
    }

    // Clear local wishlist
    setLocalWishlist([]);
    localStorage.removeItem("second-soul-wishlist");
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      // For guests, use localStorage
      setLocalWishlist(prev => {
        if (prev.includes(productId)) {
          toast.info("Removed from favorites");
          return prev.filter((id) => id !== productId);
        } else {
          toast.success("Added to favorites");
          return [...prev, productId];
        }
      });
      return;
    }

    // For authenticated users, toggle in Supabase
    const isInWishlist = wishlistIds.includes(productId);
    
    if (isInWishlist) {
      // Remove from wishlist
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .match({ user_id: user.id, product_id: productId });

      if (error) {
        console.error("Error removing from wishlist:", error);
        toast.error("Failed to remove from wishlist");
        return;
      }

      setWishlistIds(prev => prev.filter(id => id !== productId));
      toast.info("Removed from favorites");
    } else {
      // Add to wishlist
      const { error } = await supabase
        .from("wishlist_items")
        .insert([{ user_id: user.id, product_id: productId }]);

      if (error) {
        console.error("Error adding to wishlist:", error);
        toast.error("Failed to add to wishlist");
        return;
      }

      setWishlistIds(prev => [...prev, productId]);
      toast.success("Added to favorites");
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  // Update localStorage when localWishlist changes
  useEffect(() => {
    if (!user) {
      localStorage.setItem("second-soul-wishlist", JSON.stringify(localWishlist));
    }
  }, [localWishlist, user]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
