import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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

const ProductCard = ({ name, image, size, condition, price, isNew }: ProductCardProps) => {
  const [wishlisted, setWishlisted] = useState(false);

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
          <span className="condition-badge">
            {condition}/10
          </span>
        </div>

        {/* Wishlist */}
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-accent text-accent" : "text-foreground"}`} />
        </button>

        {/* Quick Add */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button variant="hero" size="sm" className="w-full gap-2 bg-primary/90 backdrop-blur-sm">
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="font-body text-sm font-medium text-foreground leading-tight truncate">{name}</h3>
        <p className="font-body text-xs text-muted-foreground">Size: {size}</p>
        <p className="font-heading text-base font-semibold text-foreground">₹{price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
