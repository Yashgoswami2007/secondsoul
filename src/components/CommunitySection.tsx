import { useInView } from "@/hooks/useInView";
import product1 from "@/assets/product-1.jpg";
import product3 from "@/assets/product-3.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";

const communityImages = [product1, product7, product3, product6];

const CommunitySection = () => {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className={`py-20 md:py-28 bg-card fade-in-section ${isVisible ? "visible" : ""}`}>
      <div className="container">
        <div className="text-center mb-12">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-3">@secondsoul</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
            Styled by Our Community
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-3">
            Share your thrift finds with #SecondSoul
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {communityImages.map((img, i) => (
            <div key={i} className="image-zoom aspect-square rounded-sm cursor-pointer">
              <img src={img} alt={`Community style ${i + 1}`} className="w-full h-full object-cover rounded-sm" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
