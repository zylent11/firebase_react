import { useNavigate } from "react-router-dom";
import useProducts from "../hooks/useProducts";

function Cart({ cart, setCart }) {
  const { products } = useProducts();
  const navigate = useNavigate();

  const handleProceed = () => {
    if (cartWithProducts.length === 0) return;

    const preparedCartItems = cartWithProducts.map((item) => {
      const active = isSaleActive(item);
      const displayPrice = active ? item.sale.salePrice : item.price;

      return {
        productId: item.id,
        title: item.title,
        author: item.author,
        quantity: item.quantity,
        priceAtPurchase: displayPrice,
        downpaymentPerUnit: null,
      };
    });

    navigate("/checkout", {
      state: {
        orderType: "regular",
        cartItems: preparedCartItems,
      },
    });
  };

  function handleIncrease(productId) {
    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function handleDecrease(productId) {
    const existingItem = cart.find((item) => item.id === productId);
    if (!existingItem) return;

    if (existingItem.quantity === 1) {
      handleRemove(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        ),
      );
    }
  }

  function handleRemove(productId) {
    setCart(cart.filter((item) => item.id !== productId));
  }

  function isSaleActive(product) {
    if (!product.sale) return false;

    const now = new Date();

    const startAt =
      product.sale.startAt instanceof Date
        ? product.sale.startAt
        : product.sale.startAt?.toDate?.();

    const endAt =
      product.sale.endAt instanceof Date
        ? product.sale.endAt
        : product.sale.endAt?.toDate?.();

    if (!startAt || !endAt) return false;

    return startAt <= now && endAt >= now;
  }

  // 🔥 STEP 5 — Merge cart + live products
  const cartWithProducts = cart
    .map((cartItem) => {
      const product = products.find((p) => p.id === cartItem.id);

      if (!product) return null;

      return {
        ...product, // live data from Firestore
        quantity: cartItem.quantity,
      };
    })
    .filter(Boolean); // remove nulls

  // 🔥 STEP 6 — Calculate total from live data
  const cartTotal = cartWithProducts.reduce((total, item) => {
    const active = isSaleActive(item);
    const displayPrice = active ? item.sale.salePrice : item.price;

    return total + displayPrice * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/" className="hover:text-indigo-600 transition-colors">
                Home
              </a>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Cart</li>
          </ol>
        </nav>

        {/* CART CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
            <p className="text-sm text-gray-500 mt-1">
              {cartWithProducts.length}{" "}
              {cartWithProducts.length === 1 ? "item" : "items"}
            </p>
          </div>

          {/* Cart Items */}
          <div className="p-6">
            {cartWithProducts.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Your cart is empty
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Start shopping to add items to your cart.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-6 px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-4">
                  {cartWithProducts.map((item) => {
                    const active = isSaleActive(item);
                    const displayPrice = active
                      ? item.sale.salePrice
                      : item.price;
                    const itemSubtotal = displayPrice * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {/* Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-gray-900 truncate">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            By {item.author}
                          </p>

                          {active && (
                            <div className="mt-1">
                              <span className="text-sm text-gray-400 line-through">
                                ₱{item.price}
                              </span>
                              <span className="ml-2 text-sm font-bold text-rose-600">
                                ₱{displayPrice}
                              </span>
                            </div>
                          )}

                          <p className="text-sm text-gray-600 mt-1">
                            ₱{displayPrice} × {item.quantity} =
                            <span className="font-bold text-gray-900 ml-1">
                              ₱{itemSubtotal.toLocaleString()}
                            </span>
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDecrease(item.id)}
                              className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleIncrease(item.id)}
                              disabled={item.quantity >= item.stock}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                                item.quantity >= item.stock
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-sm text-rose-600 hover:text-rose-700 font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Divider */}
                <hr className="my-6 border-gray-200" />

                {/* Cart Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ₱{cartTotal.toLocaleString()}
                    </span>
                  </div>
                  {/* <p className="text-xs text-gray-500 mb-4">
                    Taxes and shipping calculated at checkout
                  </p> */}
                  <button
                    className="w-full py-3 px-4 bg-indigo-600 text-white text-base font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                    onClick={handleProceed}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
