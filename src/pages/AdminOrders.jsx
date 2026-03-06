import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { doc, updateDoc } from "firebase/firestore";

async function updateOrderStatus(id, newStatus) {
  await updateDoc(doc(db, "orders", id), {
    orderStatus: newStatus,
  });
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Create a query for the orders collection, ordered by "createdAt" in descending order
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    // Listen for real-time updates using onSnapshot
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(orderList);
      setOrders(orderList);
    });

    // Clean up the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Orders</h2>

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <p>
            <strong>{order.customerName}</strong>
          </p>
          <p>Phone: {order.customer.phone}</p>
          <p>Branch: {order.customer.address}</p>
          <p>Total: ₱{order.totalAmount}</p>
          <p>Paid: ₱{order.amountPaid}</p>
          <p>Payment Status: {order.paymentStatus}</p>
          <p>Order Status: {order.orderStatus}</p>

          <button onClick={() => updateOrderStatus(order.id, "ready to ship")}>
            Mark Ready to Ship
          </button>

          <button onClick={() => updateOrderStatus(order.id, "shipped")}>
            Mark Shipped
          </button>

          <button onClick={() => updateOrderStatus(order.id, "completed")}>
            Mark Completed
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminOrders;
