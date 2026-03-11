import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";

const categories = ["all", "vintage", "streetwear", "accessories"];
const sizes = ["S", "M", "L", "XL", "One Size", "42"];
const conditions = [7, 8, 9, 10];

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [minCondition, setMinCondition] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      if (selectedSize && p.size !== selectedSize) return false;
      if (minCondition && p.condition < minCondition) return false;
      return true;
    });
  }, [selectedCategory, selectedSize, minCondition]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedSize(null);
    setMinCondition(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Shop</h1>
            <p className="font-body text-sm text-muted-foreground mt-2">
              {filtered.length} unique pieces available
            </p>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            {(selectedCategory !== "all" || selectedSize || minCondition) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-accent">
                <X className="h-3 w-3" />
                Clear all
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mb-8 p-6 bg-card rounded-sm border border-border animate-fade-in space-y-6">
              {/* Category */}
              <div>
                <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`px-4 py-1.5 rounded-full font-body text-xs font-medium transition-colors ${
                        selectedCategory === c
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                      className={`px-4 py-1.5 rounded-full font-body text-xs font-medium transition-colors ${
                        selectedSize === s
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Min Condition</h4>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setMinCondition(minCondition === c ? null : c)}
                      className={`px-4 py-1.5 rounded-full font-body text-xs font-medium transition-colors ${
                        minCondition === c
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {c}/10+
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-heading text-2xl text-foreground mb-2">No pieces found</p>
              <p className="font-body text-sm text-muted-foreground">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShopPage;
