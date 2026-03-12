import React from "react";

const items = [
    "TOP PURCHASED ITEMS",
    "★",
    "TRENDING PRODUCTS",
    "★",
    "MOST LOVED VINTAGE",
    "★",
    "HIGH DEMAND THRIFTS",
    "★",
];

const TrendingMarquee = () => {
    return (
        <div className="bg-secondary overflow-hidden py-3">
            <div className="marquee whitespace-nowrap flex items-center gap-8">
                {[...items, ...items].map((item, i) => (
                    <span key={i} className="font-body text-xs tracking-[0.2em] uppercase text-secondary-foreground">
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default TrendingMarquee;
