import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/contexts/WishlistContext";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";

const WishlistPage = () => {
  const { wishlistIds } = useWishlist();
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-6 w-6 text-accent" />
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
                Saved Favorites
              </h1>
            </div>
            <p className="font-body text-sm text-muted-foreground mt-2">
              {wishlistProducts.length} piece{wishlistProducts.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          {wishlistProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 fade-in-section visible">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <Heart className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div className="text-center">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Nothing saved yet</h2>
                <p className="font-body text-muted-foreground max-w-sm">
                  Tap the heart on any product to save it here for later.
                </p>
              </div>
              <Link to="/shop">
                <Button variant="hero" className="bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold px-8 py-4">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {wishlistProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;
