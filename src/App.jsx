import React, { useState, useEffect, Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";

// Normal import for frequently used / main page
import Home from "./pages/Home";
import Cart from "./components/Cart";
import AdminRoute from "./pages/AdminRoute";
import Logo from "./assets/images/sheperdLogo-removebg-preview.png";

// Lazy load other pages
const ProductDetail = React.lazy(() => import("./pages/ProductDetail"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const AdminOrdersPage = React.lazy(() => import("./pages/AdminOrdersPage"));
const AdminProducts = React.lazy(() => import("./pages/AdminProducts"));
const PreorderPage = React.lazy(() => import("./pages/PreorderPage"));
const CheckoutPage = React.lazy(() => import("./pages/CheckoutPage"));

function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  function handleAddToCart(product) {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) return;

      const updatedCart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );

      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          quantity: 1,
        },
      ]);
    }
  }

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#F0E7D6] border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <img
                  src={Logo} // Replace with actual image path or URL
                  alt="Store Icon"
                  className="ml-2 h-full w-32 lg:w-64 lg:block " // Add proper size and margin for the image
                />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-8">
              <Link
                to="/"
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/cart"
                className="relative text-gray-600 hover:text-indigo-600 font-medium transition-colors flex items-center"
              >
                {/* Cart Icon */}
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M9 19a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z"
                  />
                </svg>

                {/* Optional Label (Hidden on small screens) */}
                {/* <span className="ml-2 hidden sm:inline">Cart</span> */}

                {/* Badge */}
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-md">
                    {totalItems}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow">
        <Suspense
          fallback={<div className="p-8 text-center">Loading page...</div>}
        >
          <Routes>
            <Route
              path="/"
              element={<Home handleAddToCart={handleAddToCart} />}
            />
            <Route
              path="/product/:id"
              element={<ProductDetail handleAddToCart={handleAddToCart} />}
            />
            <Route
              path="/cart"
              element={<Cart cart={cart} setCart={setCart} />}
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrdersPage />
                </AdminRoute>
              }
            />
            <Route path="/preorder/:id" element={<PreorderPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* FOOTER (Optional, for completeness) */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} My Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
