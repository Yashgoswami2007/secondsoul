import { useState } from "react";
import { User, ShoppingBag, Heart, Settings, LogOut, Package, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { products } from "@/data/products";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "wishlist", label: "Saved Items", icon: Heart },
  { id: "settings", label: "Settings", icon: Settings },
];

// Mock order history
const mockOrders = [
  { id: "#SS24-001", date: "Feb 28, 2026", status: "Delivered", total: 2198, items: 2 },
  { id: "#SS24-002", date: "Mar 5, 2026", status: "Shipped", total: 899, items: 1 },
  { id: "#SS24-003", date: "Mar 10, 2026", status: "Processing", total: 3497, items: 3 },
];

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { cartItems, cartTotal } = useCart();
  const { wishlistIds } = useWishlist();
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container">
          {/* Header Card */}
          <div className="relative rounded-xl overflow-hidden mb-8 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.8)] p-8 text-primary-foreground">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center border-2 border-primary-foreground/30">
                <User className="w-9 h-9 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold">Welcome back</h1>
                <p className="font-body text-sm text-primary-foreground/70 mt-1">Member since March 2026</p>
              </div>
            </div>
            {/* Stats */}
            <div className="flex gap-8 mt-8 pt-6 border-t border-primary-foreground/20">
              {[
                { label: "Orders", value: mockOrders.length },
                { label: "Saved", value: wishlistIds.length },
                { label: "Cart Items", value: cartItems.length },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-heading font-bold text-2xl">{s.value}</p>
                  <p className="font-body text-xs text-primary-foreground/60 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="md:w-56 flex-shrink-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body font-medium text-destructive/80 hover:bg-destructive/10 transition-all mt-4">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-grow">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-2xl font-bold">My Profile</h2>
                  <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                    {[
                      { label: "Full Name", value: "Second Soul User" },
                      { label: "Email", value: "user@secondsoul.in" },
                      { label: "Phone", value: "+91 98765 43210" },
                      { label: "Location", value: "Mumbai, India" },
                    ].map((field) => (
                      <div key={field.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div>
                          <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">{field.label}</p>
                          <p className="font-body text-base font-medium text-foreground mt-1">{field.value}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                  <Button className="bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold">Edit Profile</Button>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-2xl font-bold">Order History</h2>
                  {mockOrders.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-xl border border-border">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="font-heading text-xl text-foreground">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mockOrders.map((order) => (
                        <div key={order.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-heading font-bold text-foreground">{order.id}</span>
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                order.status === "Delivered" ? "bg-green-100 text-green-700" :
                                order.status === "Shipped" ? "bg-blue-100 text-blue-700" :
                                "bg-amber-100 text-amber-700"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="font-body text-sm text-muted-foreground">{order.date} · {order.items} item{order.items !== 1 ? "s" : ""}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-heading font-bold text-lg">₹{order.total}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-2xl font-bold">Saved Items ({wishlistProducts.length})</h2>
                  {wishlistProducts.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-xl border border-border">
                      <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="font-heading text-xl text-foreground">No saved items</p>
                      <p className="font-body text-sm text-muted-foreground mt-2">Heart a product on the shop page.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {wishlistProducts.map((p) => (
                        <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden">
                          <div className="aspect-[3/4] bg-muted">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3">
                            <p className="font-body text-sm font-medium truncate">{p.name}</p>
                            <p className="font-heading font-bold text-base mt-1">₹{p.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-2xl font-bold">Settings</h2>
                  <div className="bg-card border border-border rounded-xl divide-y divide-border">
                    {[
                      { label: "Email Notifications", desc: "Receive updates on orders and drops" },
                      { label: "SMS Alerts", desc: "Get order status via SMS" },
                      { label: "Newsletter", desc: "Curated new arrivals every week" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-5">
                        <div>
                          <p className="font-body font-medium text-foreground">{item.label}</p>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                        <div className="relative w-11 h-6 rounded-full bg-primary cursor-pointer flex-shrink-0">
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountPage;
