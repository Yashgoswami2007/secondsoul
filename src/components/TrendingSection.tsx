import ProductCard from "./ProductCard";
import { products } from "@/data/products";
import { useInView } from "@/hooks/useInView";

const TrendingSection = () => {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className={`py-20 md:py-28 bg-background fade-in-section ${isVisible ? "visible" : ""}`}>
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-3">Fresh Arrivals</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
            Trending Vintage Drops
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((product, i) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
