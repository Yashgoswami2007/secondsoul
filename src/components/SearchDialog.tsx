import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const filtered = query.trim().length > 1
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          (p.description?.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleSelect = (categoryOrPath: string) => {
    navigate(`/shop?category=${categoryOrPath}`);
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) setQuery(""); }}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-xl border border-border bg-background/95 backdrop-blur-xl">
        <DialogHeader className="p-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, styles, categories…"
            className="w-full bg-transparent font-body text-base text-foreground placeholder:text-muted-foreground outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results or Quick Links */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length <= 1 ? (
            <div className="p-5">
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-4">Quick Browse</p>
              <div className="flex flex-wrap gap-2">
                {["all", "vintage", "streetwear", "men", "women", "accessories"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleSelect(cat)}
                    className="px-4 py-2 rounded-full text-sm font-body font-medium border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors capitalize"
                  >
                    {cat === "all" ? "All Products" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-body text-muted-foreground">No results for "<span className="text-foreground font-medium">{query}</span>"</p>
            </div>
          ) : (
            <div className="p-3">
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-3 px-2">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="space-y-1">
                {filtered.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product.category)}
                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left group"
                  >
                    <div className="w-12 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-body font-medium text-sm text-foreground truncate">{product.name}</p>
                      <p className="font-body text-xs text-muted-foreground capitalize">{product.category} · Size {product.size}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-heading font-bold text-sm">₹{product.price}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        className="text-xs text-accent hover:underline mt-1 font-medium"
                      >
                        + Add to Cart
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
