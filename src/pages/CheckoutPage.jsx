import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  runTransaction,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { orderType, productId, quantity, cartItems } = location.state || {};
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    customerId: "",
  });

  const [delivery, setDelivery] = useState({
    method: "home delivery",
    address: "",
    lbcBranch: {
      branchName: null,
      branchAddress: null,
    },
  });

  // 🔥 Fetch product if preorder
  useEffect(() => {
    if (orderType === "preorder" && productId) {
      const fetchProduct = async () => {
        const snap = await getDoc(doc(db, "products", productId));
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
        }
        setLoading(false);
      };

      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [orderType, productId]);

  if (loading) return <p>Loading checkout...</p>;

  // 🔥 COMPUTE TOTALS

  let totalAmount = 0;
  let downpaymentTotal = 0;

  if (orderType === "preorder" && product) {
    totalAmount = product.price * quantity;
    downpaymentTotal = product.preorder.downpaymentAmount * quantity;
  }

  if (orderType === "regular" && cartItems) {
    totalAmount = cartItems.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0,
    );
  }

  // =========================================
  // 🛒 REGULAR CHECKOUT
  // =========================================

  const handleRegularCheckout = async () => {
    try {
      await runTransaction(db, async (transaction) => {
        let computedTotal = 0;

        for (const item of cartItems) {
          const productRef = doc(db, "products", item.productId);
          const productSnap = await transaction.get(productRef);

          if (!productSnap.exists()) {
            throw new Error("Product does not exist.");
          }

          const productData = productSnap.data();

          if (item.quantity > productData.stock) {
            throw new Error(`Not enough stock for ${productData.title}`);
          }

          // 🔥 Determine if sale is active
          let isSaleActive = false;
          let finalPrice = productData.price;

          if (productData.sale) {
            const now = new Date();
            const startAt = productData.sale.startAt?.toDate?.();
            const endAt = productData.sale.endAt?.toDate?.();

            if (startAt && endAt && startAt <= now && endAt >= now) {
              isSaleActive = true;
              finalPrice = productData.sale.salePrice;
            }
          }

          computedTotal += finalPrice * item.quantity;

          // 🔥 Update stock & counts
          transaction.update(productRef, {
            stock: productData.stock - item.quantity,
            soldCount: (productData.soldCount || 0) + item.quantity,
            ...(isSaleActive && {
              "sale.soldCount":
                (productData.sale.soldCount || 0) + item.quantity,
            }),
          });
        }

        // 🔥 Create order
        const orderRef = doc(collection(db, "orders"));

        transaction.set(orderRef, {
          customer,
          delivery,
          items: cartItems,

          order: {
            category: "regular",
            status: "pending",
          },

          payment: {
            type: "full",
            status: "paid",
            amountPaid: computedTotal,
            balance: 0,
            refundAmount: 0,
          },

          totalAmount: computedTotal,
          cancelledAt: null,
          contactedAt: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      alert("Regular order placed!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =========================================
  // 📦 PREORDER CHECKOUT (TRANSACTION)
  // =========================================

  const handlePreorderCheckout = async () => {
    const productRef = doc(db, "products", productId);

    try {
      await runTransaction(db, async (transaction) => {
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error("Product does not exist.");
        }

        const productData = productSnap.data();

        const now = new Date();
        const isActive =
          productData.preorder && productData.preorder.endAt.toDate() >= now;

        if (!isActive) {
          throw new Error("Preorder has ended.");
        }

        const slotsLeft =
          productData.preorder.limit - productData.preorder.reserved;

        if (quantity > slotsLeft) {
          throw new Error("Not enough preorder slots.");
        }

        const totalAmount = productData.price * quantity;
        const downpaymentTotal =
          productData.preorder.downpaymentAmount * quantity;

        const balance = totalAmount - downpaymentTotal;

        const orderRef = doc(collection(db, "orders"));

        transaction.set(orderRef, {
          customer,
          delivery,

          items: [
            {
              productId,
              title: productData.title,
              author: productData.author,
              quantity,
              priceAtPurchase: productData.price,
              downpaymentPerUnit: productData.preorder.downpaymentAmount,
            },
          ],

          order: {
            category: "preorder",
            status: "waiting_stock",
          },

          payment: {
            type: "downpayment",
            status: "partial",
            amountPaid: downpaymentTotal,
            balance,
            refundAmount: 0,
          },

          totalAmount,
          cancelledAt: null,
          contactedAt: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        transaction.update(productRef, {
          "preorder.reserved": productData.preorder.reserved + quantity,
        });
      });

      alert("Preorder placed!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =========================================

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-indigo-600 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Checkout</li>
          </ol>
        </nav>

        {/* CHECKOUT CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {orderType === "preorder" ? "Preorder Checkout" : "Checkout"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete your {orderType === "preorder" ? "preorder" : "order"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* LEFT COLUMN - FORMS */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="John"
                      value={customer.firstName}
                      onChange={(e) =>
                        setCustomer({ ...customer, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={customer.lastName}
                      onChange={(e) =>
                        setCustomer({ ...customer, lastName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={customer.email}
                      onChange={(e) =>
                        setCustomer({ ...customer, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="09123456789"
                      value={customer.phone}
                      onChange={(e) =>
                        setCustomer({ ...customer, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delivery Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Method
                    </label>
                    <select
                      value={delivery.method}
                      onChange={(e) =>
                        setDelivery({ ...delivery, method: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="home delivery">Home Delivery</option>
                      <option value="lbc">LBC Branch Pickup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      placeholder="Complete delivery address"
                      rows={3}
                      value={delivery.address}
                      onChange={(e) =>
                        setDelivery({ ...delivery, address: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - SUMMARY */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>

                {/* Order Type Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      orderType === "preorder"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {orderType === "preorder" ? "Preorder" : "Regular Order"}
                  </span>
                </div>

                {/* Product Info (Preorder) */}
                {orderType === "preorder" && product && (
                  <div className="mb-4">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-medium text-gray-900 break-words">
                      {product.title}
                    </h4>
                    <p className="text-sm text-gray-500">By {product.author}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Quantity: {quantity}
                    </p>
                  </div>
                )}

                {/* Cart Items (Regular) */}
                {orderType === "regular" && cartItems && (
                  <div className="mb-4 space-y-2">
                    {cartItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {item.title} × {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900">
                          ₱
                          {(
                            item.priceAtPurchase * item.quantity
                          ).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  {/* <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-medium text-gray-900">
                      ₱{totalAmount.toLocaleString()}
                    </span>
                  </div> */}

                  {orderType === "preorder" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Downpayment</span>
                        <span className="font-medium text-amber-700">
                          ₱{downpaymentTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Balance Due</span>
                        <span className="font-medium text-rose-600">
                          ₱{(totalAmount - downpaymentTotal).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        ₱{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={
                    orderType === "preorder"
                      ? handlePreorderCheckout
                      : handleRegularCheckout
                  }
                  disabled={submitting}
                  className={`w-full mt-6 py-3 px-4 text-base font-medium rounded-lg transition-colors ${
                    submitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {submitting ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
