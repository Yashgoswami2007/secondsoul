import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import CartSheet from "@/components/CartSheet";
import SearchDialog from "@/components/SearchDialog";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Men", href: "/shop?category=men" },
  { label: "Women", href: "/shop?category=women" },
  { label: "Vintage", href: "/shop?category=vintage" },
  { label: "Streetwear", href: "/shop?category=streetwear" },
  { label: "Accessories", href: "/shop?category=accessories" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { cartCount } = useCart();
  const { wishlistIds } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-[#8b5a2b]/30 bg-[#8b5a2b]/[0.03] shadow-[0_2px_10px_rgba(139,90,43,0.05)] transition-all duration-300 ${scrolled ? "py-0" : "py-2"}`}>
      <nav className={`container flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14 md:h-16" : "h-16 md:h-20"}`}>
        {/* Logo */}
        <Link to="/" className={`font-heading font-bold tracking-tight text-foreground transition-all duration-300 ${scrolled ? "text-lg md:text-xl" : "text-xl md:text-2xl"}`}>
          SECOND SOUL
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.href}
                className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 tracking-wide"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-foreground" onClick={() => setSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
          <Link to="/wishlist">
            <Button variant="ghost" size="icon" className="hidden sm:flex text-foreground relative">
              <Heart className="h-5 w-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-foreground"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
          <Link to="/account">
            <Button variant="ghost" size="icon" className="hidden sm:flex text-foreground">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background border-t border-border animate-fade-in">
          <ul className="container py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="text-base font-body font-medium text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Cart Sheet */}
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
};

export default Navbar;
