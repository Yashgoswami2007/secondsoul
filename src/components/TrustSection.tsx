import { ShieldCheck, Truck, RotateCcw, Star } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const trustItems = [
  { icon: ShieldCheck, title: "Secure Payment", desc: "256-bit SSL encrypted checkout" },
  { icon: Truck, title: "Fast Shipping", desc: "Free delivery on orders over ₹999" },
  { icon: RotateCcw, title: "Easy Returns", desc: "7-day hassle-free returns" },
  { icon: Star, title: "Quality Checked", desc: "Every piece graded & inspected" },
];

const TrustSection = () => {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className={`py-16 bg-background border-y border-border fade-in-section ${isVisible ? "visible" : ""}`}>
      <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
        {trustItems.map((item) => (
          <div key={item.title} className="flex flex-col items-center text-center gap-2">
            <item.icon className="h-6 w-6 text-primary mb-1" />
            <h4 className="font-body text-sm font-semibold text-foreground">{item.title}</h4>
            <p className="font-body text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustSection;
