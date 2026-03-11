import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";
import product2 from "@/assets/product-2.jpg";
import product5 from "@/assets/product-5.jpg";

const collections = [
  {
    title: "Streetwear\nCollection",
    description: "Curated vintage streetwear from the best eras.",
    image: product5,
    href: "/shop?category=streetwear",
    span: "md:col-span-1",
  },
  {
    title: "Rare\nFinds",
    description: "One-of-a-kind pieces you won't find anywhere else.",
    image: product2,
    href: "/shop?category=vintage",
    span: "md:col-span-1",
  },
];

const CollectionBanner = () => {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className={`py-20 md:py-28 bg-card fade-in-section ${isVisible ? "visible" : ""}`}>
      <div className="container">
        <div className="grid md:grid-cols-2 gap-6">
          {collections.map((col) => (
            <div
              key={col.title}
              className={`relative overflow-hidden rounded-sm aspect-[4/3] group ${col.span}`}
            >
              <img
                src={col.image}
                alt={col.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 md:p-10">
                <h3 className="font-heading text-2xl md:text-4xl font-bold text-secondary whitespace-pre-line leading-tight mb-2">
                  {col.title}
                </h3>
                <p className="font-body text-sm text-secondary/70 mb-4 max-w-xs">{col.description}</p>
                <Link to={col.href}>
                  <Button variant="hero" size="sm" className="bg-secondary text-foreground hover:bg-secondary/90">
                    Explore
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Under ₹999 Banner */}
        <div className="mt-6 relative overflow-hidden rounded-sm bg-primary p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-2">Budget Friendly</p>
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground">
              Under ₹999 Collection
            </h3>
            <p className="font-body text-sm text-primary-foreground/70 mt-2">Premium thrift, pocket-friendly prices.</p>
          </div>
          <Link to="/shop?maxPrice=999">
            <Button variant="gold" size="lg" className="px-10">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CollectionBanner;
