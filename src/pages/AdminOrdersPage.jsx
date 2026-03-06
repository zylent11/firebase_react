import { Link } from "react-router-dom";
import OrderDetailModal from "./OrderDetailModal";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

function AdminOrdersPage() {
  const getStatusBadge = (status) => {
    const styles = {
      waiting_stock: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ready_to_ship: "bg-blue-100 text-blue-800 border-blue-200",
      shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  const [categoryTab, setCategoryTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let q = collection(db, "orders");

    const constraints = [];

    if (categoryTab !== "all") {
      constraints.push(where("order.category", "==", categoryTab));
    }

    if (statusFilter !== "all") {
      constraints.push(where("order.status", "==", statusFilter));
    }

    constraints.push(orderBy("createdAt", "desc"));

    const finalQuery = query(q, ...constraints);

    const unsubscribe = onSnapshot(finalQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);
    });

    return () => unsubscribe();
  }, [categoryTab, statusFilter]);

  const handleMarkAsPaid = async (orderId) => {
    const orderRef = doc(db, "orders", orderId);

    await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) throw new Error("Order not found");

      const orderData = orderSnap.data();

      if (orderData.payment.balance === 0)
        throw new Error("Already fully paid");

      transaction.update(orderRef, {
        "payment.status": "paid",
        "payment.amountPaid": orderData.totalAmount,
        "payment.balance": 0,
        "payment.paidAt": serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  };

  const handleMarkAsShipped = async (orderId) => {
    const orderRef = doc(db, "orders", orderId);

    try {
      await updateDoc(orderRef, {
        "order.status": "shipped",
        shippedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMarkAsCompleted = async (orderId) => {
    const orderRef = doc(db, "orders", orderId);

    try {
      await updateDoc(orderRef, {
        "order.status": "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleFulfillPreorder = async (orderId) => {
    const orderRef = doc(db, "orders", orderId);

    await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) throw new Error("Order not found");

      const orderData = orderSnap.data();

      if (orderData.payment.balance > 0) throw new Error("Balance not paid");

      const item = orderData.items[0];
      const productRef = doc(db, "products", item.productId);

      const productSnap = await transaction.get(productRef);
      const productData = productSnap.data();

      if (productData.stock < item.quantity)
        throw new Error("Not enough stock");

      transaction.update(productRef, {
        stock: productData.stock - item.quantity,
        soldCount: (productData.soldCount || 0) + item.quantity,
        "preorder.reserved": productData.preorder.reserved - item.quantity,
      });

      transaction.update(orderRef, {
        "order.status": "ready_to_ship",
        updatedAt: serverTimestamp(),
      });
    });
  };

  const handleCancelPreorder = async (orderId) => {
    const orderRef = doc(db, "orders", orderId);

    await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) throw new Error("Order not found");

      const orderData = orderSnap.data();

      const item = orderData.items[0];
      const productRef = doc(db, "products", item.productId);

      const productSnap = await transaction.get(productRef);
      const productData = productSnap.data();

      transaction.update(productRef, {
        "preorder.reserved": productData.preorder.reserved - item.quantity,
      });

      transaction.update(orderRef, {
        "order.status": "cancelled",
        cancelledAt: serverTimestamp(),
        "payment.status": "refunded",
        "payment.refundAmount": orderData.payment.amountPaid,
        updatedAt: serverTimestamp(),
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-10 font-sans">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                Dashboard
              </Link>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="text-gray-900 font-medium">Products</span>
            </nav>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {/* <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-700">A</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Admin</span> */}
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Admin Orders
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all incoming orders.
          </p>
        </div>

        {/* CONTROLS: TABS & FILTER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* CATEGORY TABS */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg self-start">
            {["all", "preorder", "regular"].map((tab) => (
              <button
                key={tab}
                onClick={() => setCategoryTab(tab)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${
                    categoryTab === tab
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* STATUS FILTER */}
          <div className="relative w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="waiting_stock">Waiting Stock</option>
              <option value="ready_to_ship">Ready to Ship</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* ORDERS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No orders found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {statusFilter !== "all" ? (
                    <span>
                      No{" "}
                      <strong className="text-gray-700">
                        {statusFilter.replace("_", " ")}
                      </strong>{" "}
                      orders found.
                    </span>
                  ) : categoryTab !== "all" ? (
                    <span>
                      No{" "}
                      <strong className="text-gray-700">{categoryTab}</strong>{" "}
                      orders found.
                    </span>
                  ) : (
                    <span>No orders available yet.</span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer flex flex-col"
              >
                {/* Card Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-start">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase tracking-wide">
                    {order.order.category}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(order.order.status)}`}
                  >
                    {order.order.status.replace("_", " ")}
                  </span>
                </div>

                {/* Card Body */}
                <div className="px-5 py-5 flex-1">
                  <div className="flex justify-between items-baseline mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
                      {order.customer.firstName} {order.customer.lastName}
                    </h3>
                    <span className="text-lg font-bold text-gray-900">
                      ₱{order.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        order.payment.status === "Paid"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {order.payment.status === "Paid" ? "●" : "○"}{" "}
                      {order.payment.status}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-mono text-gray-500">
                    Order #{order.id}
                  </span>
                  <span className="text-xs text-indigo-600 font-medium group-hover:translate-x-1 transition-transform">
                    View Details →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL */}

        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrderId(null)}
            onMarkPaid={handleMarkAsPaid}
            onFulfill={handleFulfillPreorder}
            onCancel={handleCancelPreorder}
            onShip={handleMarkAsShipped}
            onComplete={handleMarkAsCompleted}
          />
        )}
      </div>
    </div>
  );
}

export default AdminOrdersPage;
