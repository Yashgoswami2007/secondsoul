import { useState, useEffect } from "react";
import { User, ShoppingBag, Heart, Settings, LogOut, Package, ChevronRight, MapPin, Bell, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { products } from "@/data/products";
import { toast } from "sonner";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "wishlist", label: "Saved Items", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Settings", icon: Settings },
];

interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  email_notifications: boolean;
  sms_alerts: boolean;
  newsletter: boolean;
  created_at: string;
}

interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address: any;
  created_at: string;
  updated_at: string;
}

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { cartItems } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, "id" | "created_at" | "user_id">>({
    label: "Home",
    line1: "",
    line2: null,
    city: "",
    state: "",
    pincode: "",
    is_default: false
  });
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  // Load user data
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    
    // Load profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (profileError) {
      console.error("Error loading profile:", profileError);
      toast.error("Failed to load profile data");
    } else {
      setProfile(profileData);
    }

    // Load addresses
    const { data: addressesData, error: addressesError } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user?.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (addressesError) {
      console.error("Error loading addresses:", addressesError);
      toast.error("Failed to load addresses");
    } else {
      setAddresses(addressesData || []);
    }

    // Load orders
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error loading orders:", ordersError);
      toast.error("Failed to load orders");
    } else {
      setOrders(ordersData || []);
      
      // Load order items for each order
      const itemsMap: Record<string, any[]> = {};
      for (const order of ordersData || []) {
        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select(`
            *,
            products (image_url)
          `)
          .eq("order_id", order.id);
        
        if (!itemsError && itemsData) {
          itemsMap[order.id] = itemsData;
        }
      }
      setOrderItems(itemsMap);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const addAddress = async (addressData: Omit<Address, "id" | "created_at" | "user_id">) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("addresses")
      .insert([
        {
          ...addressData,
          user_id: user.id
        }
      ])
      .select();

    if (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address");
      return;
    }

    toast.success("Address added successfully");
    setAddresses(prev => [data[0], ...prev]);
  };

  const updateAddress = async (id: string, addressData: Partial<Address>) => {
    const { error } = await supabase
      .from("addresses")
      .update(addressData)
      .eq("id", id);

    if (error) {
      console.error("Error updating address:", error);
      toast.error("Failed to update address");
      return;
    }

    toast.success("Address updated successfully");
    setAddresses(prev => 
      prev.map(addr => addr.id === id ? { ...addr, ...addressData } : addr)
    );
  };

  const removeAddress = async (id: string) => {
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error removing address:", error);
      toast.error("Failed to remove address");
      return;
    }

    toast.success("Address removed successfully");
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return;

    // First, unset all other default addresses
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true);

    // Then set this address as default
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id);

    if (error) {
      console.error("Error setting default address:", error);
      toast.error("Failed to set default address");
      return;
    }

    toast.success("Default address updated");
    setAddresses(prev => 
      prev.map(addr => ({
        ...addr,
        is_default: addr.id === id
      }))
    );
  };

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
                <h1 className="font-heading text-3xl font-bold">
                  {profile?.display_name || "Welcome back"}
                </h1>
                <p className="font-body text-sm text-primary-foreground/70 mt-1">
                  Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "March 2026"}
                </p>
              </div>
            </div>
            {/* Stats */}
            <div className="flex gap-8 mt-8 pt-6 border-t border-primary-foreground/20">
              {[
                { label: "Orders", value: orders.length },
                { label: "Saved", value: wishlistIds.length },
                { label: "Addresses", value: addresses.length },
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
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body font-medium text-destructive/80 hover:bg-destructive/10 transition-all mt-4"
                >
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
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 rounded-full border-2 border-[#FFD166] border-t-transparent animate-spin" />
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                      {[
                        { label: "Full Name", value: profile?.display_name || "Not set" },
                        { label: "Email", value: profile?.email || "Not set" },
                        { label: "Phone", value: profile?.phone || "Not set" },
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
                  )}
                  <Button className="bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold">Edit Profile</Button>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-2xl font-bold">Order History</h2>
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 rounded-full border-2 border-[#FFD166] border-t-transparent animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-xl border border-border">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="font-heading text-xl text-foreground">No orders yet</p>
                      <p className="font-body text-sm text-muted-foreground mt-2">Your orders will appear here once you make a purchase.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const items = orderItems[order.id] || [];
                        return (
                          <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-border">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <span className="font-heading font-bold text-foreground">#{order.id.substring(0, 8)}</span>
                                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                    order.status === "Delivered" ? "bg-green-100 text-green-700" :
                                    order.status === "Shipped" ? "bg-blue-100 text-blue-700" :
                                    order.status === "Processing" ? "bg-amber-100 text-amber-700" :
                                    "bg-gray-100 text-gray-700"
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                                <p className="font-body text-sm text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                                <p className="font-heading font-bold text-lg">₹{order.total?.toFixed(2) || "0.00"}</p>
                              </div>
                            </div>
                            <div className="p-5">
                              <div className="space-y-3">
                                {items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                                      {item.products?.image_url ? (
                                        <img src={item.products.image_url} alt={item.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Package className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-grow">
                                      <p className="font-body font-medium text-foreground">{item.name}</p>
                                      <p className="font-body text-sm text-muted-foreground">
                                        Qty: {item.quantity} × ₹{item.price?.toFixed(2) || "0.00"}
                                      </p>
                                    </div>
                                    <p className="font-heading font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>
                              {items.length === 0 && (
                                <p className="font-body text-muted-foreground text-center py-4">No items found for this order</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
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

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="font-heading text-2xl font-bold">Address Book</h2>
                    <Button 
                      className="bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold text-sm"
                      onClick={() => setShowAddAddressForm(true)}
                    >
                      Add Address
                    </Button>
                  </div>
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 rounded-full border-2 border-[#FFD166] border-t-transparent animate-spin" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-xl border border-border">
                      <MapPin className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="font-heading text-xl text-foreground">No addresses saved</p>
                      <p className="font-body text-sm text-muted-foreground mt-2">Add your delivery addresses for faster checkout.</p>
                      <Button 
                        className="mt-4 bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold"
                        onClick={() => setShowAddAddressForm(true)}
                      >
                        Add Address
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="bg-card border border-border rounded-xl p-5 relative">
                          {address.is_default && (
                            <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-[#FFD166] text-black font-medium">
                              Default
                            </span>
                          )}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                              <MapPin className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="font-heading font-bold text-foreground">{address.label}</h3>
                              <p className="font-body text-sm text-muted-foreground mt-1">
                                {address.line1}{address.line2 && `, ${address.line2}`}<br />
                                {address.city}, {address.state} {address.pincode}
                              </p>
                              <div className="flex gap-3 mt-3">
                                <button 
                                  className="font-body text-xs text-[#FFD166] hover:underline"
                                  onClick={() => {
                                    // TODO: Implement edit address modal
                                    toast.info("Edit address functionality coming soon");
                                  }}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="font-body text-xs text-destructive hover:underline"
                                  onClick={() => removeAddress(address.id)}
                                >
                                  Remove
                                </button>
                                {!address.is_default && (
                                  <button 
                                    className="font-body text-xs text-accent hover:underline"
                                    onClick={() => setDefaultAddress(address.id)}
                                  >
                                    Set as Default
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add Address Form Modal */}
              {showAddAddressForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <div className="bg-card border border-border rounded-xl w-full max-w-md animate-fade-in">
                    <div className="flex justify-between items-center p-5 border-b border-border">
                      <h3 className="font-heading text-lg font-bold">Add New Address</h3>
                      <button 
                        onClick={() => setShowAddAddressForm(false)}
                        className="p-1 rounded-md hover:bg-muted"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="font-body text-xs text-muted-foreground block mb-1.5">Address Label</label>
                        <select
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-body text-xs text-muted-foreground block mb-1.5">Address Line 1</label>
                        <Input
                          value={newAddress.line1}
                          onChange={(e) => setNewAddress({...newAddress, line1: e.target.value})}
                          placeholder="Street address"
                        />
                      </div>
                      <div>
                        <label className="font-body text-xs text-muted-foreground block mb-1.5">Address Line 2 (Optional)</label>
                        <Input
                          value={newAddress.line2 || ""}
                          onChange={(e) => setNewAddress({...newAddress, line2: e.target.value || null})}
                          placeholder="Apartment, suite, etc."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-body text-xs text-muted-foreground block mb-1.5">City</label>
                          <Input
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="font-body text-xs text-muted-foreground block mb-1.5">State</label>
                          <Input
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                            placeholder="State"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-body text-xs text-muted-foreground block mb-1.5">PIN Code</label>
                        <Input
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                          placeholder="PIN code"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_default"
                          checked={newAddress.is_default}
                          onChange={(e) => setNewAddress({...newAddress, is_default: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <label htmlFor="is_default" className="font-body text-sm">Set as default address</label>
                      </div>
                    </div>
                    <div className="flex gap-3 p-5 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddAddressForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold"
                        onClick={async () => {
                          if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
                            toast.error("Please fill in all required fields");
                            return;
                          }
                          
                          await addAddress(newAddress);
                          setShowAddAddressForm(false);
                          setNewAddress({
                            label: "Home",
                            line1: "",
                            line2: null,
                            city: "",
                            state: "",
                            pincode: "",
                            is_default: false
                          });
                        }}
                      >
                        Save Address
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-2xl font-bold">Settings</h2>
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 rounded-full border-2 border-[#FFD166] border-t-transparent animate-spin" />
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-xl divide-y divide-border">
                      {[
                        { 
                          label: "Email Notifications", 
                          desc: "Receive updates on orders and drops",
                          value: profile?.email_notifications ?? true,
                          key: "email_notifications"
                        },
                        { 
                          label: "SMS Alerts", 
                          desc: "Get order status via SMS",
                          value: profile?.sms_alerts ?? true,
                          key: "sms_alerts"
                        },
                        { 
                          label: "Newsletter", 
                          desc: "Curated new arrivals every week",
                          value: profile?.newsletter ?? false,
                          key: "newsletter"
                        },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-5">
                          <div>
                            <p className="font-body font-medium text-foreground">{item.label}</p>
                            <p className="font-body text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                          <div 
                            className={`relative w-11 h-6 rounded-full cursor-pointer flex-shrink-0 transition-colors ${
                              item.value ? "bg-[#FFD166]" : "bg-muted"
                            }`}
                            onClick={async () => {
                              if (!profile) return;
                              
                              const newValue = !item.value;
                              const { error } = await supabase
                                .from("profiles")
                                .update({ [item.key]: newValue })
                                .eq("id", user.id);
                              
                              if (error) {
                                toast.error("Failed to update settings");
                                return;
                              }
                              
                              setProfile({ ...profile, [item.key]: newValue });
                              toast.success("Settings updated");
                            }}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              item.value ? "translate-x-6" : "translate-x-1"
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
