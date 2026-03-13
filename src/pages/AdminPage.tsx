import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3,
  Plus, Pencil, Trash2, X, Check, Search,
  DollarSign, Clock, ChevronRight, ArrowUpRight, ArrowLeft,
  LogOut, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ───────────────────────────── Types ──────────────────────────────────
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  size: string | null;
  condition: number | null;
  category: string | null;
  fabric: string | null;
  image_url: string | null;
  is_new: boolean;
  available: boolean;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  user_id: string;
  customer_name: string | null;
  phone: string | null;
  email: string | null;
  subtotal: number | null;
  shipping_cost: number | null;
  total: number | null;
  status: string;
  payment_status: string | null;
  payment_method: string | null;
  shipping_address: any | null;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string | null;
  price: number | null;
  size: string | null;
  condition: number | null;
  quantity: number;
}

const statusColor: Record<string, string> = {
  Delivered: "bg-emerald-100 text-emerald-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Pending: "bg-gray-100 text-gray-500",
  Cancelled: "bg-red-100 text-red-700",
};

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const emptyProduct: Omit<Product, "id" | "created_at" | "updated_at"> = {
  name: "",
  description: "",
  price: 0,
  size: "",
  condition: 8,
  category: "vintage",
  fabric: "",
  image_url: "",
  is_new: false,
  available: true,
};

// ───────────────────────────── Component ──────────────────────────────────
const AdminPage = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // ── State ─────────────────────────────
  const [loading, setLoading] = useState(true);
  
  // ── Data state ─────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  
  // ── UI state ─────────────────────────────
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, "id" | "created_at" | "updated_at">>({ ...emptyProduct });
  const [searchQuery, setSearchQuery] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  // ── Check admin access ─────────────────────────────
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate("/");
        return;
      }

      // Admin access is handled by AuthContext
      // Just set loading to false since isAdmin comes from context
      setLoading(false);
    };

    checkAdminAccess();
  }, [user, navigate]);

  // ── Load data ─────────────────────────────
  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    await Promise.all([
      loadProducts(),
      loadOrders()
    ]);
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
      return;
    }

    setProducts(data || []);
  };

  const loadOrders = async () => {
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error loading orders:", ordersError);
      toast.error("Failed to load orders");
      return;
    }

    setOrders(ordersData || []);

    // Load order items for each order
    const itemsMap: Record<string, OrderItem[]> = {};
    for (const order of ordersData || []) {
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      if (!itemsError && itemsData) {
        itemsMap[order.id] = itemsData;
      }
    }
    setOrderItems(itemsMap);
  };

  // ── Product handlers ───────────────────
  const saveEdit = async () => {
    if (!editingProduct) return;

    const { error } = await supabase
      .from("products")
      .update({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        size: editingProduct.size,
        condition: editingProduct.condition,
        category: editingProduct.category,
        fabric: editingProduct.fabric,
        image_url: editingProduct.image_url,
        is_new: editingProduct.is_new,
        available: editingProduct.available,
        updated_at: new Date().toISOString()
      })
      .eq("id", editingProduct.id);

    if (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
      return;
    }

    toast.success("Product updated successfully");
    setEditingProduct(null);
    loadProducts();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
      return;
    }

    toast.success("Product deleted successfully");
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error("Please fill in required fields");
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .insert([{
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        size: newProduct.size,
        condition: newProduct.condition,
        category: newProduct.category,
        fabric: newProduct.fabric,
        image_url: newProduct.image_url,
        is_new: newProduct.is_new,
        available: newProduct.available,
      }])
      .select();

    if (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
      return;
    }

    toast.success("Product added successfully");
    setProducts(prev => [data[0], ...prev]);
    setNewProduct({ ...emptyProduct });
    setIsAdding(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
      return;
    }

    toast.success("Order status updated");
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status, updated_at: new Date().toISOString() } : order
      )
    );
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredOrders = orders.filter(
    (o) =>
      (o.customer_name && o.customer_name.toLowerCase().includes(orderSearch.toLowerCase())) ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.status.toLowerCase().includes(orderSearch.toLowerCase())
  );

  // ── Stats ──────────────────────────────
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const delivered = orders.filter((o) => o.status === "Delivered").length;
  const pending = orders.filter((o) => o.status === "Pending" || o.status === "Processing").length;

  // ── Bar chart helper ───────────────────
  const salesByCategory: Record<string, number> = {};
  orders.forEach((order) => { 
    salesByCategory["All"] = (salesByCategory["All"] || 0) + (order.total || 0); 
  });
  
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];
  categories.forEach((cat) => {
    const catProducts = products.filter((p) => p.category === cat);
    salesByCategory[cat] = catProducts.reduce((sum, p) => sum + p.price, 0);
  });
  
  const maxSales = Math.max(...Object.values(salesByCategory));

  // ── Loading state ─────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#FFD166] border-t-transparent animate-spin" />
          <p className="font-body text-sm text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // ── Unauthorized access ─────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="font-body text-muted-foreground mb-6">
            You don't have permission to access the admin panel. Only administrators can view this page.
          </p>
          <Button 
            onClick={() => navigate("/")} 
            className="bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold"
          >
            Back to Store
          </Button>
        </div>
      </div>
    );
  }

  // ── Unauthorized access ─────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="font-body text-muted-foreground mb-6">
            You don't have permission to access the admin panel. Only administrators can view this page.
          </p>
          <Button 
            onClick={() => navigate("/")} 
            className="bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold"
          >
            Back to Store
          </Button>
        </div>
      </div>
    );
  }

  // ── Main admin panel ─────────────────────────────
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex">
      {/* ───── Sidebar ───── */}
      <aside className="w-60 flex-shrink-0 bg-foreground text-primary-foreground flex flex-col min-h-screen sticky top-0">
        <div className="px-6 py-7 border-b border-secondary/10">
          <Link to="/" className="flex items-center gap-2 text-secondary/90 hover:text-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-body text-xs">Back to Store</span>
          </Link>
          <h1 className="font-heading text-xl font-bold text-secondary mt-4">Admin Panel</h1>
          <p className="font-body text-xs text-secondary/40 mt-0.5">Second Soul</p>
        </div>
        <nav className="flex-grow px-3 py-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-secondary/10 text-secondary"
                    : "text-secondary/50 hover:bg-secondary/5 hover:text-secondary/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="px-6 py-5 border-t border-secondary/10">
          <p className="font-body text-[10px] text-secondary/30 uppercase tracking-wider">Logged in as</p>
          <p className="font-body text-xs text-secondary/60 mt-0.5 font-medium truncate">
            {user?.email || "Administrator"}
          </p>
          <button
            onClick={signOut}
            className="mt-3 flex items-center gap-2 text-xs font-body text-secondary/40 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ───── Main Content ───── */}
      <main className="flex-grow p-8 overflow-auto">
        {/* ══ DASHBOARD ══ */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground">Dashboard</h2>
              <p className="font-body text-sm text-muted-foreground mt-1">Overview of your store performance</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: "+12%", color: "bg-emerald-50 text-emerald-600" },
                { label: "Total Orders", value: orders.length, icon: ShoppingBag, trend: "+5%", color: "bg-blue-50 text-blue-600" },
                { label: "Total Products", value: products.length, icon: Package, trend: "+3", color: "bg-violet-50 text-violet-600" },
                { label: "Pending Orders", value: pending, icon: Clock, trend: "Active", color: "bg-amber-50 text-amber-600" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {stat.trend}
                      </span>
                    </div>
                    <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Recent orders */}
            <div className="bg-card border border-border rounded-xl">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-heading text-lg font-bold">Recent Orders</h3>
                <button onClick={() => setActiveTab("orders")} className="text-xs text-accent hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="divide-y divide-border">
                {orders.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm">#{order.id.substring(0, 8)}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[order.status]}`}>{order.status}</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        {order.customer_name || "Unknown Customer"} · {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-heading font-bold text-sm">₹{order.total?.toFixed(2) || "0.00"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ PRODUCTS ══ */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold text-foreground">Products</h2>
                <p className="font-body text-sm text-muted-foreground mt-1">{products.length} total products</p>
              </div>
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="pl-9"
              />
            </div>

            {/* Add form */}
            {isAdding && (
              <div className="bg-card border border-[#FFD166]/30 rounded-xl p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-heading text-lg font-bold">New Product</h3>
                  <button onClick={() => setIsAdding(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: "name", label: "Product Name", type: "text" },
                    { key: "price", label: "Price (₹)", type: "number" },
                    { key: "size", label: "Size", type: "text" },
                    { key: "condition", label: "Condition (1-10)", type: "number" },
                    { key: "fabric", label: "Fabric", type: "text" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="font-body text-xs text-muted-foreground block mb-1.5">{field.label}</label>
                      <Input
                        type={field.type as any}
                        value={(newProduct as any)[field.key]}
                        onChange={(e) => setNewProduct((prev) => ({ ...prev, [field.key]: field.type === "number" ? +e.target.value : e.target.value }))}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="font-body text-xs text-muted-foreground block mb-1.5">Category</label>
                    <select
                      value={newProduct.category || ""}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value || null }))}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
                    >
                      <option value="">Select category</option>
                      {["vintage", "streetwear", "accessories", "men", "women"].map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-xs text-muted-foreground block mb-1.5">Image URL</label>
                    <Input
                      type="text"
                      value={newProduct.image_url || ""}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, image_url: e.target.value || null }))}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="is_new"
                      checked={newProduct.is_new}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, is_new: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_new" className="font-body text-sm">New Arrival</label>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="available"
                      checked={newProduct.available}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, available: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <label htmlFor="available" className="font-body text-sm">Available</label>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="font-body text-xs text-muted-foreground block mb-1.5">Description</label>
                  <textarea
                    value={newProduct.description || ""}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value || null }))}
                    rows={2}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm resize-none"
                  />
                </div>
                <Button onClick={addProduct} className="mt-4 bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold gap-2">
                  <Check className="w-4 h-4" />
                  Save Product
                </Button>
              </div>
            )}

            {/* Product table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    {["Product", "Category", "Size", "Condition", "Price", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-body text-xs uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((prod) => (
                    editingProduct?.id === prod.id ? (
                      <tr key={prod.id} className="bg-secondary/20">
                        <td className="px-5 py-3">
                          <Input
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={editingProduct.category || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value || null })}
                            className="px-2 py-1 rounded border border-input bg-background text-xs font-body"
                          >
                            <option value="">Select category</option>
                            {["vintage", "streetwear", "accessories", "men", "women"].map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          <Input 
                            value={editingProduct.size || ""} 
                            onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value || null })} 
                            className="h-8 text-xs w-16" 
                          />
                        </td>
                        <td className="px-5 py-3">
                          <Input 
                            type="number" 
                            value={editingProduct.condition || ""} 
                            onChange={(e) => setEditingProduct({ ...editingProduct, condition: e.target.value ? +e.target.value : null })} 
                            className="h-8 text-xs w-16" 
                          />
                        </td>
                        <td className="px-5 py-3">
                          <Input 
                            type="number" 
                            value={editingProduct.price} 
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: +e.target.value })} 
                            className="h-8 text-xs w-24" 
                          />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="p-1.5 rounded-md bg-emerald-100 text-emerald-600 hover:bg-emerald-200">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingProduct(null)} className="p-1.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={prod.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                              {prod.image_url ? (
                                <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <span className="font-body font-medium text-sm text-foreground">{prod.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-body text-xs text-muted-foreground capitalize">
                          {prod.category || "Uncategorized"}
                        </td>
                        <td className="px-5 py-3.5 font-body text-xs text-muted-foreground">
                          {prod.size || "-"}
                        </td>
                        <td className="px-5 py-3.5 font-body text-xs text-muted-foreground">
                          {prod.condition ? `${prod.condition}/10` : "-"}
                        </td>
                        <td className="px-5 py-3.5 font-heading font-bold text-sm">₹{prod.price.toFixed(2)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingProduct({ ...prod })}
                              className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteProduct(prod.id)}
                              className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="font-body text-muted-foreground">No products found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ ORDERS ══ */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground">Orders</h2>
              <p className="font-body text-sm text-muted-foreground mt-1">
                {orders.length} total orders · {delivered} delivered · {pending} pending
              </p>
            </div>

            {/* Order status summary pills */}
            <div className="flex flex-wrap gap-3">
              {Object.entries({ 
                All: orders.length, 
                Delivered: delivered, 
                Shipped: orders.filter((o) => o.status === "Shipped").length, 
                Processing: orders.filter((o) => o.status === "Processing").length, 
                Pending: orders.filter((o) => o.status === "Pending").length,
                Cancelled: orders.filter((o) => o.status === "Cancelled").length
              }).map(([label, count]) => (
                <div key={label} className={`px-4 py-2 rounded-full text-xs font-medium border ${
                  label === "All" ? "bg-foreground text-secondary border-foreground" : "bg-card border-border text-muted-foreground"
                }`}>
                  {label}: {count}
                </div>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={orderSearch} 
                onChange={(e) => setOrderSearch(e.target.value)} 
                placeholder="Search by customer, ID, or status…" 
                className="pl-9" 
              />
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    {["Order ID", "Customer", "Items", "Total", "Status", "Date", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-body text-xs uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => {
                    const items = orderItems[order.id] || [];
                    return (
                      <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4 font-heading font-bold text-sm">#{order.id.substring(0, 8)}</td>
                        <td className="px-5 py-4 font-body text-sm text-foreground">
                          {order.customer_name || "Unknown Customer"}
                        </td>
                        <td className="px-5 py-4 font-body text-xs text-muted-foreground max-w-[160px]">
                          <p className="truncate">
                            {items.length > 0 
                              ? `${items[0].name}${items.length > 1 ? ` +${items.length - 1} more` : ""}` 
                              : "No items"}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-heading font-bold text-sm">₹{order.total?.toFixed(2) || "0.00"}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-body text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="px-2 py-1 rounded border border-input bg-background text-xs font-body"
                          >
                            {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <p className="font-body text-muted-foreground">No orders found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground">Analytics</h2>
              <p className="font-body text-sm text-muted-foreground mt-1">Store performance overview</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {[
                { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, sub: "All time" },
                { label: "Avg Order Value", value: orders.length > 0 ? `₹${Math.round(totalRevenue / orders.length)}` : "₹0", sub: "Per order" },
                { label: "Conversion Rate", value: "3.4%", sub: "Visitors to buyers" },
                { label: "Return Rate", value: "1.2%", sub: "Last 30 days" },
                { label: "Active Products", value: products.filter(p => p.available).length, sub: "In stock" },
                { label: "Customers", value: new Set(orders.map(o => o.user_id)).size, sub: "Unique buyers" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-card border border-border rounded-xl p-5">
                  <p className="font-heading text-2xl font-bold text-foreground">{kpi.value}</p>
                  <p className="font-body text-sm font-medium text-foreground mt-1">{kpi.label}</p>
                  <p className="font-body text-xs text-muted-foreground">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Bar chart: inventory value per category */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading text-lg font-bold mb-6">Inventory Value by Category</h3>
              <div className="space-y-4">
                {Object.entries(salesByCategory).filter(([k]) => k !== "All" && k).map(([cat, value]) => (
                  <div key={cat} className="flex items-center gap-4">
                    <p className="font-body text-xs text-muted-foreground capitalize w-24 flex-shrink-0">{cat}</p>
                    <div className="flex-grow bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-[#FFD166] rounded-full transition-all duration-700"
                        style={{ width: `${maxSales > 0 ? (value / maxSales) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="font-heading font-bold text-sm w-20 text-right">₹{value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order status breakdown */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading text-lg font-bold mb-6">Order Status Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {["Delivered", "Shipped", "Processing", "Pending", "Cancelled"].map((status) => {
                  const count = orders.filter((o) => o.status === status).length;
                  const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                  return (
                    <div key={status} className={`rounded-xl p-4 ${statusColor[status]?.replace("text-", "bg-opacity-10 text-") || "bg-gray-100 text-gray-700"}`}>
                      <p className="font-heading text-2xl font-bold">{count}</p>
                      <p className="font-body text-sm font-medium mt-1">{status}</p>
                      <p className="font-body text-xs opacity-70 mt-0.5">{pct}% of orders</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;