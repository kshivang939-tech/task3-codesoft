import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Check, ChevronDown, Heart, Menu, Minus, Plus, Search,
  ShoppingBag, Sparkles, Trash2, UserRound, X
} from "lucide-react";
import { api } from "./api.js";

const fallbackProducts = [
  { _id: "p1", name: "Everyday Oversized Tee", category: "Tops", price: 799, oldPrice: 999, badge: "BESTSELLER", color: "Sand", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85" },
  { _id: "p2", name: "Relaxed Linen Shirt", category: "Tops", price: 1499, oldPrice: 1899, badge: "NEW", color: "White", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=85" },
  { _id: "p3", name: "Classic Straight Jeans", category: "Bottoms", price: 2199, oldPrice: 2599, badge: "", color: "Blue", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85" },
  { _id: "p4", name: "Minimal Everyday Hoodie", category: "Outerwear", price: 1899, oldPrice: 2299, badge: "POPULAR", color: "Grey", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85" },
  { _id: "p5", name: "Soft Knit Cardigan", category: "Outerwear", price: 2499, oldPrice: 2999, badge: "", color: "Cream", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85" },
  { _id: "p6", name: "Weekend Utility Trousers", category: "Bottoms", price: 1799, oldPrice: 2099, badge: "", color: "Olive", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85" },
  { _id: "p7", name: "Daily Canvas Tote", category: "Accessories", price: 599, oldPrice: 799, badge: "ECO PICK", color: "Natural", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85" },
  { _id: "p8", name: "Modern Ribbed Tank", category: "Tops", price: 699, oldPrice: 899, badge: "", color: "Black", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85" }
];
const categories = ["All", "Tops", "Bottoms", "Outerwear", "Accessories"];
const money = n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function App() {
  const [products, setProducts] = useState(fallbackProducts);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("shopease_cart") || "[]"));
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [drawer, setDrawer] = useState(false);
  const [modal, setModal] = useState("");
  const [notice, setNotice] = useState("");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("shopease_user") || "null"));
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [checkout, setCheckout] = useState({ address: "", city: "", pincode: "", phone: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/products").then(data => setProducts(data.products)).catch(() => {});
  }, []);
  useEffect(() => localStorage.setItem("shopease_cart", JSON.stringify(cart)), [cart]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 2600);
    return () => clearTimeout(id);
  }, [notice]);

  const shownProducts = useMemo(() => {
    let result = products.filter(p =>
      (category === "All" || p.category === category) &&
      `${p.name} ${p.category} ${p.color || ""}`.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "low") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "high") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, category, search, sort]);

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 2499 ? 0 : 99;

  function addToCart(product) {
    setCart(old => {
      const existing = old.find(item => item._id === product._id);
      return existing
        ? old.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...old, { ...product, quantity: 1 }];
    });
    setNotice(`${product.name} added to your bag`);
  }
  function changeQty(id, amount) {
    setCart(old => old.map(item => item._id === id ? { ...item, quantity: item.quantity + amount } : item).filter(item => item.quantity > 0));
  }
  async function submitAuth(event) {
    event.preventDefault(); setBusy(true);
    try {
      const data = await api(`/auth/${modal === "register" ? "register" : "login"}`, {
        method: "POST", body: JSON.stringify(authForm)
      });
      localStorage.setItem("shopease_token", data.token);
      localStorage.setItem("shopease_user", JSON.stringify(data.user));
      setUser(data.user); setModal(""); setNotice(`Welcome, ${data.user.name}!`);
      setAuthForm({ name: "", email: "", password: "" });
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }
  async function submitOrder(event) {
    event.preventDefault();
    if (!user) { setNotice("Please sign in before checkout"); setModal("login"); return; }
    if (!cart.length) return;
    setBusy(true);
    try {
      const data = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map(item => ({ productId: item._id, quantity: item.quantity })),
          shippingAddress: checkout
        })
      });
      setCart([]); setModal("success"); setNotice(`Order ${data.order.orderNumber} placed`);
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }
  function signOut() {
    localStorage.removeItem("shopease_token"); localStorage.removeItem("shopease_user");
    setUser(null); setNotice("You have signed out");
  }

  return <div className="site-shell">
    <div className="announcement"><Sparkles size={14} /> A little more you, in every outfit <span>·</span> Free shipping over ₹2,499</div>
    <header className="header">
      <button className="icon-btn mobile-menu" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu /></button>
      <a className="wordmark" href="#home" aria-label="ShopEase home">shop<span>ease.</span></a>
      <nav className="desktop-nav">
        <a href="#shop">New arrivals</a><a href="#shop" onClick={() => setCategory("Tops")}>Clothing</a><a href="#story">Our story</a>
      </nav>
      <div className="header-actions">
        <label className="search-box"><Search size={17}/><input aria-label="Search products" value={search} onChange={e => { setSearch(e.target.value); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }} placeholder="Search styles..." /></label>
        {user ? <button className="icon-btn account-btn" onClick={signOut} title="Sign out"><UserRound/><span className="account-name">{user.name.split(" ")[0]}</span></button> : <button className="icon-btn" onClick={() => setModal("login")} aria-label="Sign in"><UserRound /></button>}
        <button className="icon-btn bag-button" onClick={() => setDrawer(true)} aria-label="Open shopping bag"><ShoppingBag />{count > 0 && <span className="bag-count">{count}</span>}</button>
      </div>
    </header>

    <main>
      <section className="hero" id="home">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-line"></span> THE EVERYDAY EDIT · 2026</span>
          <h1>Wear your<br/><em>own story.</em></h1>
          <p>Considered essentials. Effortless layers. Pieces that feel like you — on your best days and ordinary ones.</p>
          <a className="primary-btn" href="#shop">Explore the collection <ArrowRight size={17}/></a>
          <div className="hero-foot"><div className="avatar-stack"><span>J</span><span>A</span><span>M</span></div><span><b>2,400+</b> happy wardrobes</span><span className="rating">★★★★★ <small>4.9/5</small></span></div>
        </div>
        <div className="hero-art">
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=90" alt="Friends browsing a thoughtfully curated clothing collection"/>
          <div className="hero-sticker"><span>LESS, BUT</span><b>better.</b><span>STYLE NOTE Nº 01</span></div>
          <div className="image-caption">YOUR NEW EVERYDAY UNIFORM <span>↗</span></div>
        </div>
        <div className="hero-side-note">MADE FOR REAL LIFE — EST. 2024</div>
      </section>

      <section className="trust-strip">
        <div><span className="trust-icon">✳</span><span><b>Thoughtfully made</b><small>Better everyday essentials</small></span></div>
        <div><span className="trust-icon">↺</span><span><b>Easy 7-day returns</b><small>Shopping without the stress</small></span></div>
        <div><span className="trust-icon">♡</span><span><b>Feel-good fabrics</b><small>Comfort comes first</small></span></div>
        <div><span className="trust-icon">⌁</span><span><b>Free shipping</b><small>On orders over ₹2,499</small></span></div>
      </section>

      <section className="shop-section section-wrap" id="shop">
        <div className="section-heading">
          <div><span className="eyebrow">THE GOOD STUFF</span><h2>Find your <em>favourite.</em></h2><p>Versatile pieces, endless ways to wear them.</p></div>
          <a href="#shop" className="text-link" onClick={() => { setCategory("All"); setSearch(""); }}>View all pieces <ArrowRight size={16}/></a>
        </div>
        <div className="filter-row">
          <div className="category-tabs">{categories.map(c => <button key={c} className={category === c ? "category-tab active" : "category-tab"} onClick={() => setCategory(c)}>{c}</button>)}</div>
          <label className="sort-select">Sort by <select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name</option></select><ChevronDown size={14}/></label>
        </div>
        <div className="product-grid">
          {shownProducts.map((p, i) => <article className="product-card" key={p._id}>
            <div className="product-image-wrap">
              <img src={p.image} alt={p.name} loading={i > 3 ? "lazy" : "eager"} />
              {p.badge && <span className="product-badge">{p.badge}</span>}
              <button className="wish-btn" aria-label={`Add ${p.name} to wishlist`} onClick={() => setNotice("Wishlist is a demo feature — coming soon")}><Heart size={17}/></button>
              <button className="quick-add" onClick={() => addToCart(p)}><Plus size={16}/> Add to bag</button>
            </div>
            <div className="product-info"><div><span className="product-category">{p.category}</span><h3>{p.name}</h3><span className="product-color"><i style={{ background: p.color?.toLowerCase() === "white" ? "#f3f0e9" : p.color?.toLowerCase() }}></i>{p.color || "Everyday colour"}</span></div><div className="product-prices"><b>{money(p.price)}</b>{p.oldPrice && <del>{money(p.oldPrice)}</del>}</div></div>
          </article>)}
        </div>
        {shownProducts.length === 0 && <div className="empty-results"><Search size={30}/><h3>No styles found</h3><p>Try another search or category.</p><button className="outline-btn" onClick={() => {setSearch("");setCategory("All");}}>Clear filters</button></div>}
        <div className="collection-bottom"><span>Showing {shownProducts.length} of {products.length} thoughtfully picked pieces</span><span>GOOD STYLE. NO GUESSWORK. ✳</span></div>
      </section>

      <section className="editorial" id="story">
        <div className="editorial-image"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1100&q=85" alt="Minimal everyday fashion editorial"/></div>
        <div className="editorial-copy"><span className="eyebrow">A SMALL NOTE FROM US</span><h2>Good clothes.<br/><em>Good energy.</em></h2><p>We believe getting dressed should feel less like a decision and more like a little act of self-expression. So we keep the fits easy, the colours wearable, and the details intentional.</p><a className="text-link" href="#shop">Meet your next favourite <ArrowRight size={16}/></a><div className="handwritten">with love, shopEase ♡</div></div>
      </section>

      <section className="newsletter"><div><span className="eyebrow">THE GOOD NEWS CLUB</span><h2>A little style in<br/>your <em>inbox.</em></h2><p>New drops, outfit notes and 10% off your first order.</p></div><form onSubmit={e => {e.preventDefault();setNotice("Thanks for joining the Good News Club!");e.target.reset();}} className="newsletter-form"><label htmlFor="newsletter-email">Your email address</label><div><input id="newsletter-email" type="email" required placeholder="you@example.com"/><button type="submit" aria-label="Subscribe"><ArrowRight/></button></div><small>By subscribing, you agree to receive occasional updates. No spam, ever.</small></form></section>
    </main>

    <footer className="footer"><a className="wordmark" href="#home">shop<span>ease.</span></a><p>Wear what feels like you.</p><div className="footer-links"><a href="#shop">Shop</a><a href="#story">Our story</a><a href="mailto:hello@shopease.example">Contact</a></div><small>© 2026 ShopEase. Student project demo.</small></footer>

    {drawer && <div className="overlay" onClick={() => setDrawer(false)}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">YOUR LITTLE FINDS</span><h2>Your bag <span>({count})</span></h2></div><button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close bag"><X/></button></div>
      {cart.length === 0 ? <div className="empty-cart"><div className="empty-bag"><ShoppingBag size={28}/></div><h3>Your bag is taking a nap.</h3><p>Find something that feels like you.</p><button className="primary-btn" onClick={() => {setDrawer(false);document.getElementById("shop")?.scrollIntoView({behavior:"smooth"});}}>Explore the collection <ArrowRight size={16}/></button></div> :
      <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item._id}><img src={item.image} alt={item.name}/><div className="cart-item-details"><h3>{item.name}</h3><span>{money(item.price)}</span><div className="qty-control"><button onClick={() => changeQty(item._id,-1)} aria-label="Decrease quantity"><Minus size={13}/></button><span>{item.quantity}</span><button onClick={() => changeQty(item._id,1)} aria-label="Increase quantity"><Plus size={13}/></button></div></div><button className="remove-btn" onClick={() => setCart(old => old.filter(x => x._id !== item._id))} aria-label="Remove item"><Trash2 size={16}/></button></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Shipping</span><b>{shipping === 0 ? "FREE" : money(shipping)}</b></div><div className="summary-total"><span>Total</span><b>{money(subtotal + shipping)}</b></div><small>{subtotal >= 2499 ? "Lovely! Your shipping is on us." : `Add ${money(2499-subtotal)} more for free shipping.`}</small><button className="primary-btn checkout-btn" onClick={() => {setDrawer(false);setModal("checkout");}}>Continue to checkout <ArrowRight size={16}/></button><p className="secure-note">♡ A little joy, packed with care.</p></div></>}
    </aside></div>}

    {modal && <div className="modal-backdrop" onClick={() => setModal("")}><section className="modal-card" onClick={e => e.stopPropagation()}>
      <button className="modal-close icon-btn" onClick={() => setModal("")} aria-label="Close dialog"><X/></button>
      {["login","register"].includes(modal) && <><span className="eyebrow">WELCOME TO YOUR HAPPY PLACE</span><h2>{modal === "register" ? "Make it official." : "Good to see you."}</h2><p className="modal-intro">{modal === "register" ? "Create an account and keep your favourites close." : "Sign in to continue to your little finds."}</p><form className="stack-form" onSubmit={submitAuth}>{modal === "register" && <label>Your name<input required minLength="2" value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})} placeholder="Your full name"/></label>}<label>Email address<input required type="email" value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input required minLength="6" type="password" value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} placeholder="At least 6 characters"/></label><button className="primary-btn full-btn" disabled={busy}>{busy ? "One moment..." : modal === "register" ? "Create account" : "Sign in"} <ArrowRight size={16}/></button></form><p className="switch-auth">{modal === "register" ? "Already part of the club?" : "New around here?"} <button onClick={()=>setModal(modal==="register"?"login":"register")}>{modal==="register"?"Sign in":"Create an account"}</button></p></>}
      {modal === "checkout" && <><span className="eyebrow">ALMOST YOURS</span><h2>Where should we send it?</h2><p className="modal-intro">Your order total is <b>{money(subtotal + shipping)}</b>. This is a demo checkout — no payment is collected.</p><form className="stack-form" onSubmit={submitOrder}><label>Delivery address<input required value={checkout.address} onChange={e=>setCheckout({...checkout,address:e.target.value})} placeholder="House / street / area"/></label><div className="form-pair"><label>City<input required value={checkout.city} onChange={e=>setCheckout({...checkout,city:e.target.value})} placeholder="City"/></label><label>PIN code<input required pattern="[0-9]{6}" value={checkout.pincode} onChange={e=>setCheckout({...checkout,pincode:e.target.value})} placeholder="6 digits"/></label></div><label>Phone number<input required pattern="[0-9]{10}" value={checkout.phone} onChange={e=>setCheckout({...checkout,phone:e.target.value})} placeholder="10-digit mobile number"/></label><button className="primary-btn full-btn" disabled={busy}>{busy?"Placing order...":"Place demo order"} <ArrowRight size={16}/></button></form><p className="switch-auth">Want to change your bag? <button onClick={()=>{setModal("");setDrawer(true);}}>Back to bag</button></p></>}
      {modal === "success" && <div className="success-state"><div className="success-icon"><Check size={30}/></div><span className="eyebrow">THAT'S A WRAP</span><h2>Order received!</h2><p>Your demo order has been saved. In a production store, this is where confirmation and payment details would appear.</p><button className="primary-btn full-btn" onClick={()=>{setModal("");window.scrollTo({top:0,behavior:"smooth"});}}>Back to shopping <ArrowRight size={16}/></button></div>}
    </section></div>}
    {notice && <div className="toast"><Check size={16}/>{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss message"><X size={14}/></button></div>}
    {drawer && <div className="mobile-nav-drawer"><button onClick={()=>setDrawer(false)}><X size={18}/> Close</button><a onClick={()=>setDrawer(false)} href="#shop">Shop collection</a><a onClick={()=>setDrawer(false)} href="#story">Our story</a></div>}
  </div>;
}
