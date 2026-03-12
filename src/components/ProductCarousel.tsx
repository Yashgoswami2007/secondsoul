import { products } from "@/data/products";

const ProductCarousel = () => {
  // We duplicate the items array so that .marquee (which translates -50%) will loop seamlessly.
  const carouselItems = [...products, ...products];

  return (
    <section className="py-16 md:py-24 bg-background overflow-hidden border-t border-border">
      <div className="container mb-10 md:mb-12">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground text-center">
          Featured Collection
        </h2>
        <p className="font-body text-sm text-muted-foreground text-center mt-3 uppercase tracking-widest leading-relaxed">
          Scroll Through Our Latest Picks
        </p>
      </div>

      {/* Carousel Track Container */}
      <div className="relative w-full flex overflow-hidden">
        {/* 
          .marquee is defined in index.css as a continuous infinite horizontal translation map.
          Added hover:[animation-play-state:paused] to stop animation on hover, giving users time to view.
        */}
        <div 
          className="marquee w-max flex items-stretch gap-4 md:gap-6 px-4 md:px-0 hover:[animation-play-state:paused]"
          style={{ animationDuration: "60s" }}
        >
          {carouselItems.map((product, idx) => (
            <div
              key={`${product.id}-${idx}`}
              className="w-[280px] md:w-[320px] flex-shrink-0 group/card rounded-sm bg-card overflow-hidden hover-lift flex flex-col whitespace-normal border border-border"
            >
              {/* Product Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Product Info: Image, Price, Short Desc ONLY */}
              <div className="p-4 md:p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <h3
                    className="font-body text-base font-semibold text-foreground line-clamp-1"
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                  <p className="font-heading text-lg font-bold text-foreground whitespace-nowrap">
                    ₹{product.price}
                  </p>
                </div>
                {/* Short description truncated to 2 lines */}
                <p className="font-body text-sm text-muted-foreground line-clamp-2">
                  {product.description || product.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
