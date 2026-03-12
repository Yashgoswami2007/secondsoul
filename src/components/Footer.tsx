import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-secondary py-16">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-heading text-xl font-bold mb-3">SECOND SOUL</h3>
            <p className="font-body text-xs text-secondary/60 leading-relaxed">
              Sustainable thrift fashion curated for unique souls. Give clothes a second life.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body text-xs font-semibold uppercase tracking-wider mb-4 text-secondary/80">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Shop", "About Us", "Sustainability"].map((l) => (
                <li key={l}>
                  <Link to="/" className="font-body text-xs text-secondary/50 hover:text-secondary transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-body text-xs font-semibold uppercase tracking-wider mb-4 text-secondary/80">Categories</h4>
            <ul className="space-y-2">
              {["Vintage Collection", "Streetwear", "Accessories", "Under ₹999"].map((l) => (
                <li key={l}>
                  <Link to="/shop" className="font-body text-xs text-secondary/50 hover:text-secondary transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-body text-xs font-semibold uppercase tracking-wider mb-4 text-secondary/80">Support</h4>
            <ul className="space-y-2">
              {["Contact Us", "Shipping & Returns", "Size Guide", "FAQ"].map((l) => (
                <li key={l}>
                  <Link to="/" className="font-body text-xs text-secondary/50 hover:text-secondary transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-secondary/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-secondary/40">© Second Soul 2026. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {[Instagram].map((Icon, i) => (
              <a key={i} href="#" className="text-secondary/40 hover:text-secondary transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
            {/* Pinterest & TikTok as text since no lucide icons */}
            <a href="#" className="font-body text-xs text-secondary/40 hover:text-secondary transition-colors">Pinterest</a>
            <Link to="/admin" className="font-body text-xs text-secondary/40 hover:text-secondary transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
