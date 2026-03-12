import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3,
  Plus, Pencil, Trash2, X, Check, Search,
  DollarSign, Clock, ChevronRight, ArrowUpRight, ArrowLeft,
  Lock, Eye, EyeOff, ShieldCheck, LogOut,
} from "lucide-react";
import { products as initialProducts, Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ───────────────────────────── Mock Data ──────────────────────────────────
const mockOrders = [
  { id: "#SS001", customer: "Aarav Shah", items: ["Vintage Nike Hoodie", "Graphic Camp Tee"], total: 1398, status: "Delivered", date: "Feb 26, 2026" },
  { id: "#SS002", customer: "Priya Mehta", items: ["Leather Crossbody Bag"], total: 1499, status: "Shipped", date: "Mar 2, 2026" },
  { id: "#SS003", customer: "Rohan Verma", items: ["Classic Bomber Jacket", "Tech Cargo Pants"], total: 3198, status: "Processing", date: "Mar 7, 2026" },
  { id: "#SS004", customer: "Neha Joshi", items: ["Ribbed Midi Dress"], total: 1299, status: "Pending", date: "Mar 10, 2026" },
  { id: "#SS005", customer: "Kiran Das", items: ["Wool Turtleneck Sweater", "Corduroy Wide Trousers"], total: 1798, status: "Delivered", date: "Mar 11, 2026" },
  { id: "#SS006", customer: "Ananya Singh", items: ["Satin Slip Skirt", "Lace Trim Cami"], total: 1398, status: "Processing", date: "Mar 12, 2026" },
];

const statusColor: Record<string, string> = {
  Delivered: "bg-emerald-100 text-emerald-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Pending: "bg-gray-100 text-gray-500",
};

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const emptyProduct: Omit<Product, "image"> & { image: string } = {
  id: "",
  name: "",
  image: "",
  size: "M",
  condition: 9,
  price: 0,
  category: "vintage",
  description: "",
  fabric: "",
};

// ───────────────────────────── Auth constants ─────────────────────────────
const ADMIN_USER = "admin@soulstore_1";
const ADMIN_PASS = "3#$hksht&b";
const SESSION_KEY = "ss_admin_auth";

// ───────────────────────────── Component ──────────────────────────────────
const AdminPage = () => {
  // ── Auth state ─────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true"
  );
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [shaking, setShaking] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === ADMIN_USER && loginPassword === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Please try again.");
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setLoginUsername("");
    setLoginPassword("");
  };

  // ── Login gate ─────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-foreground flex items-center justify-center p-6">
        <div className={`w-full max-w-sm transition-all duration-150 ${shaking ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
          style={shaking ? { animation: "shake 0.4s ease" } : {}}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFD166]/10 border border-[#FFD166]/30 mb-4">
              <Lock className="w-6 h-6 text-[#FFD166]" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-secondary">Admin Access</h1>
            <p className="font-body text-xs text-secondary/40 mt-1">Second Soul Control Panel</p>
          </div>

          {/* Form card */}
          <form onSubmit={handleLogin} className="bg-secondary/5 border border-secondary/10 rounded-2xl p-8 space-y-5">
            <div>
              <label className="font-body text-xs text-secondary/50 uppercase tracking-wider block mb-2">Username</label>
              <Input
                type="text"
                value={loginUsername}
                onChange={(e) => { setLoginUsername(e.target.value); setLoginError(""); }}
                placeholder="admin@soulstore_1"
                autoFocus
                autoComplete="username"
                className="bg-secondary/5 border-secondary/20 text-secondary placeholder:text-secondary/20 focus-visible:ring-[#FFD166]/40 focus-visible:border-[#FFD166]/40"
              />
            </div>
            <div>
              <label className="font-body text-xs text-secondary/50 uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="bg-secondary/5 border-secondary/20 text-secondary placeholder:text-secondary/20 focus-visible:ring-[#FFD166]/40 focus-visible:border-[#FFD166]/40 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30 hover:text-secondary/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="font-body text-xs text-red-400 flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" />
                {loginError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold py-5 mt-2"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Sign In to Admin
            </Button>
          </form>

          <div className="text-center mt-6">
            <Link to="/" className="font-body text-xs text-secondary/30 hover:text-secondary/60 transition-colors flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin state ────────────────────────────
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [orderList] = useState(mockOrders);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<typeof emptyProduct>({ ...emptyProduct });
  const [searchQuery, setSearchQuery] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  // ── Stats ──────────────────────────────
  const totalRevenue = mockOrders.reduce((a, o) => a + o.total, 0);
  const delivered = mockOrders.filter((o) => o.status === "Delivered").length;
  const pending = mockOrders.filter((o) => o.status === "Pending" || o.status === "Processing").length;

  // ── Product handlers ───────────────────
  const saveEdit = () => {
    if (!editingProduct) return;
    setProductList((prev) => prev.map((p) => (p.id === editingProduct.id ? editingProduct : p)));
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    setProductList((prev) => prev.filter((p) => p.id !== id));
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    const product: Product = { ...newProduct, id: `custom-${Date.now()}`, image: newProduct.image || "" };
    setProductList((prev) => [product, ...prev]);
    setNewProduct({ ...emptyProduct });
    setIsAdding(false);
  };

  const filteredProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orderList.filter(
    (o) =>
      o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.status.toLowerCase().includes(orderSearch.toLowerCase())
  );

  // ── Bar chart helper ───────────────────
  const salesByCategory: Record<string, number> = {};
  mockOrders.forEach((order) => { salesByCategory["All"] = (salesByCategory["All"] || 0) + order.total; });
  ["vintage", "streetwear", "men", "women", "accessories"].forEach((cat) => {
    const cat_products = productList.filter((p) => p.category === cat);
    salesByCategory[cat] = cat_products.reduce((a, p) => a + p.price, 0);
  });
  const maxSales = Math.max(...Object.values(salesByCategory));

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
          <p className="font-body text-xs text-secondary/60 mt-0.5 font-medium">{ADMIN_USER}</p>
          <button
            onClick={handleLogout}
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
                { label: "Total Orders", value: mockOrders.length, icon: ShoppingBag, trend: "+5%", color: "bg-blue-50 text-blue-600" },
                { label: "Total Products", value: productList.length, icon: Package, trend: "+3", color: "bg-violet-50 text-violet-600" },
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
                {mockOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm">{order.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[order.status]}`}>{order.status}</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{order.customer}</p>
                    </div>
                    <p className="font-heading font-bold text-sm">₹{order.total}</p>
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
                <p className="font-body text-sm text-muted-foreground mt-1">{productList.length} total products</p>
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
                        type={field.type}
                        value={(newProduct as any)[field.key]}
                        onChange={(e) => setNewProduct((prev) => ({ ...prev, [field.key]: field.type === "number" ? +e.target.value : e.target.value }))}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="font-body text-xs text-muted-foreground block mb-1.5">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
                    >
                      {["vintage", "streetwear", "accessories", "men", "women"].map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="font-body text-xs text-muted-foreground block mb-1.5">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
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
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            className="px-2 py-1 rounded border border-input bg-background text-xs font-body"
                          >
                            {["vintage", "streetwear", "accessories", "men", "women"].map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          <Input value={editingProduct.size} onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value })} className="h-8 text-xs w-16" />
                        </td>
                        <td className="px-5 py-3">
                          <Input type="number" value={editingProduct.condition} onChange={(e) => setEditingProduct({ ...editingProduct, condition: +e.target.value })} className="h-8 text-xs w-16" />
                        </td>
                        <td className="px-5 py-3">
                          <Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: +e.target.value })} className="h-8 text-xs w-24" />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="p-1.5 rounded-md bg-emerald-100 text-emerald-600 hover:bg-emerald-200"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditingProduct(null)} className="p-1.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={prod.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-body font-medium text-sm text-foreground">{prod.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-body text-xs text-muted-foreground capitalize">{prod.category}</td>
                        <td className="px-5 py-3.5 font-body text-xs text-muted-foreground">{prod.size}</td>
                        <td className="px-5 py-3.5 font-body text-xs text-muted-foreground">{prod.condition}/10</td>
                        <td className="px-5 py-3.5 font-heading font-bold text-sm">₹{prod.price}</td>
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
              <p className="font-body text-sm text-muted-foreground mt-1">{orderList.length} total orders · {delivered} delivered · {pending} pending</p>
            </div>

            {/* Order status summary pills */}
            <div className="flex flex-wrap gap-3">
              {Object.entries({ All: orderList.length, Delivered: delivered, Shipped: orderList.filter((o) => o.status === "Shipped").length, Processing: orderList.filter((o) => o.status === "Processing").length, Pending: orderList.filter((o) => o.status === "Pending").length }).map(([label, count]) => (
                <div key={label} className={`px-4 py-2 rounded-full text-xs font-medium border ${label === "All" ? "bg-foreground text-secondary border-foreground" : "bg-card border-border text-muted-foreground"}`}>
                  {label}: {count}
                </div>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Search by customer, ID, or status…" className="pl-9" />
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    {["Order ID", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-body text-xs uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4 font-heading font-bold text-sm">{order.id}</td>
                      <td className="px-5 py-4 font-body text-sm text-foreground">{order.customer}</td>
                      <td className="px-5 py-4 font-body text-xs text-muted-foreground max-w-[160px]">
                        <p className="truncate">{order.items.join(", ")}</p>
                      </td>
                      <td className="px-5 py-4 font-heading font-bold text-sm">₹{order.total}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[order.status]}`}>{order.status}</span>
                      </td>
                      <td className="px-5 py-4 font-body text-xs text-muted-foreground">{order.date}</td>
                    </tr>
                  ))}
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
                { label: "Avg Order Value", value: `₹${Math.round(totalRevenue / mockOrders.length)}`, sub: "Per order" },
                { label: "Conversion Rate", value: "3.4%", sub: "Visitors to buyers" },
                { label: "Return Rate", value: "1.2%", sub: "Last 30 days" },
                { label: "Active Products", value: productList.length, sub: "In catalogue" },
                { label: "Customers", value: mockOrders.length, sub: "Unique buyers" },
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
                {Object.entries(salesByCategory).filter(([k]) => k !== "All").map(([cat, value]) => (
                  <div key={cat} className="flex items-center gap-4">
                    <p className="font-body text-xs text-muted-foreground capitalize w-24 flex-shrink-0">{cat}</p>
                    <div className="flex-grow bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-[#FFD166] rounded-full transition-all duration-700"
                        style={{ width: `${(value / maxSales) * 100}%` }}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Delivered", "Shipped", "Processing", "Pending"].map((status) => {
                  const count = orderList.filter((o) => o.status === status).length;
                  const pct = Math.round((count / orderList.length) * 100);
                  return (
                    <div key={status} className={`rounded-xl p-4 ${statusColor[status]?.replace("text-", "bg-opacity-10 text-")}`}>
                      <p className="font-heading text-2xl font-bold">{count}</p>
                      <p className="font-body text-sm font-medium mt-1">{status}</p>
                      <p className="font-body text-xs opacity-70 mt-0.5">{pct}% of all orders</p>
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
