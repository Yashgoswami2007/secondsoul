const items = [
  "Sustainable Fashion",
  "★",
  "Vintage Curated",
  "★",
  "One-of-a-Kind",
  "★",
  "Eco Conscious",
  "★",
  "Premium Thrift",
  "★",
  "Second Life",
  "★",
];

const MarqueeBanner = () => {
  return (
    <div className="bg-primary overflow-hidden py-3">
      <div className="marquee whitespace-nowrap flex items-center gap-8">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="font-body text-xs tracking-[0.2em] uppercase text-primary-foreground/70">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
