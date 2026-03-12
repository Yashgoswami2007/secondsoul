import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-main.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Stylish person wearing vintage thrift clothing"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center md:text-left max-w-4xl mt-12 md:mt-0">
        <p className="font-body text-xs md:text-sm tracking-[0.3em] uppercase text-secondary mb-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Sustainable Fashion · Curated Vintage
        </p>
        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-[#FFE8B3] leading-[0.95] mb-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          SECOND
          <br />
          <span className="italic font-normal">Soul</span>
        </h1>
        <p className="font-body text-base md:text-lg text-[#FFD166] font-medium bg-black/40 backdrop-blur-sm px-5 py-4 rounded-lg border border-[#FFD166]/20 max-w-md mx-auto md:mx-0 mb-8 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          Give clothes a second life. Sustainable thrift fashion curated for unique souls.
        </p>
        <div className="flex flex-wrap justify-center md:justify-start gap-4 animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <Link to="/shop">
            <Button variant="hero" size="lg" className="px-10 py-6 bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold border-none">
              Shop Now
            </Button>
          </Link>
          <Link to="/shop?category=vintage">
            <Button variant="hero-outline" size="lg" className="px-10 py-6 border-[#FFD166] text-[#FFD166] hover:bg-[#FFD166] hover:text-black font-bold">
              Explore Vintage
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-secondary/50 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-secondary/70" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
