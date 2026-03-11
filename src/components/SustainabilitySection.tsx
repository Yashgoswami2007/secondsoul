import { Droplets, Leaf, Recycle } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import sustainabilityBg from "@/assets/sustainability-bg.jpg";

const stats = [
  { icon: Droplets, value: "10", unit: "gallons", label: "of water saved per purchase" },
  { icon: Recycle, value: "12kg", unit: "", label: "of textile waste prevented" },
  { icon: Leaf, value: "60%", unit: "", label: "lower carbon footprint" },
];

const SustainabilitySection = () => {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className={`relative py-24 md:py-32 overflow-hidden fade-in-section ${isVisible ? "visible" : ""}`}>
      {/* Background */}
      <div className="absolute inset-0">
        <img src={sustainabilityBg} alt="Sustainability" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-background/85" />
      </div>

      <div className="relative z-10 container text-center">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-3">Our Promise</p>
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">
          Fashion With A Conscience
        </h2>
        <p className="font-body text-base text-muted-foreground max-w-2xl mx-auto mb-6">
          Every thrift purchase reduces textile waste and saves precious resources. Your style choices make a real impact.
        </p>
        <p className="font-body text-sm text-accent font-medium max-w-2xl mx-auto mb-14">
          Together, our global thrifted community has saved over 32 million gallons of water and prevented 50,000 kg of textile waste.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                {stat.value}
                {stat.unit && <span className="text-lg text-muted-foreground ml-1">{stat.unit}</span>}
              </p>
              <p className="font-body text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SustainabilitySection;
