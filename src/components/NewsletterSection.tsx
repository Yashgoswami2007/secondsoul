import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className={`py-20 md:py-28 bg-primary fade-in-section ${isVisible ? "visible" : ""}`}>
      <div className="container text-center max-w-xl">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
          Join the Second Soul Community
        </h2>
        <p className="font-body text-sm text-primary-foreground/70 mb-8">
          Get exclusive thrift drops, early access, and sustainable fashion inspiration.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setEmail("");
          }}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-sm bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <Button variant="gold" size="lg" type="submit">
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
