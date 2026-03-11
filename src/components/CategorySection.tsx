import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";
import categoryMen from "@/assets/category-men.jpg";
import categoryWomen from "@/assets/category-women.jpg";

const categories = [
  {
    title: "Shop Men",
    image: categoryMen,
    href: "/shop?category=men",
  },
  {
    title: "Shop Women",
    image: categoryWomen,
    href: "/shop?category=women",
  },
];

const CategorySection = () => {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className={`py-20 md:py-28 bg-background fade-in-section ${isVisible ? "visible" : ""}`}>
      <div className="container">
        <div className="text-center mb-12">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-3">Browse By</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
            Shop Your Style
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              to={cat.href}
              className="relative overflow-hidden rounded-sm aspect-[3/4] md:aspect-[4/5] group block"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-center">
                <h3 className="font-heading text-3xl md:text-4xl font-bold text-secondary mb-4">
                  {cat.title}
                </h3>
                <span className="inline-block font-body text-sm tracking-widest uppercase text-secondary/80 border-b border-secondary/40 pb-1 group-hover:border-secondary transition-colors">
                  Explore Collection
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
