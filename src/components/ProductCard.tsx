import { Heart, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  size: string;
  condition: number;
  price: number;
  category?: string;
  isNew?: boolean;
}

const ProductCard = ({ id, name, image, size, condition, price, category, isNew }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const wishlisted = isInWishlist(id);

  return (
    <div className="group hover-lift">
      {/* Image */}
      <div className="relative image-zoom rounded-sm bg-card aspect-[3/4] mb-3">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded-sm"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && (
            <span className="px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-body font-bold uppercase tracking-wider rounded-sm">
              New Drop
            </span>
          )}
          <div className="relative group/condition">
            <span className="condition-badge cursor-help">
              {condition}/10
            </span>
            <div className="absolute left-full top-0 ml-2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 invisible group-hover/condition:opacity-100 group-hover/condition:visible transition-all duration-200 z-10 pointer-events-none">
              <p className="font-semibold mb-1">Condition Details</p>
              <p>{condition >= 9 ? "Like new, minimal to zero flaws." : condition >= 7 ? "Gently used, minor fading or faint wear." : "Noticeable wear, possible small pinholes or marks."}</p>
            </div>
          </div>
        </div>

        {/* Wishlist */}
        <button
          onClick={() => toggleWishlist(id)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-accent text-accent" : "text-foreground"}`} />
        </button>

        {/* Quick Add */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button 
            variant="hero" 
            size="sm" 
            className="w-full gap-2 bg-primary/90 backdrop-blur-sm"
            onClick={() => addToCart({ id, name, image, size, condition, price, category: category || "", isNew })}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 mt-3 px-1">
        <h3 className="font-body text-sm font-medium text-foreground leading-tight truncate" title={name}>{name}</h3>
        <p className="font-body text-xs text-muted-foreground">Size: {size}</p>
        <div className="flex items-center justify-between">
          <p className="font-heading text-base font-semibold text-foreground">₹{price}</p>
          <div className="flex items-center text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < 4 ? "fill-current" : "fill-current opacity-30"}`} />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">({(Math.random() * (4.9 - 4.0) + 4.0).toFixed(1)})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
