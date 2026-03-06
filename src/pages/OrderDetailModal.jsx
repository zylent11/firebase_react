function OrderDetailModal({
  order,
  onClose,
  onMarkPaid,
  onFulfill,
  onCancel,
  onShip,
  onComplete,
}) {
  if (!order) return null;

  const canShip = order.order.status === "ready_to_ship";
  const canComplete = order.order.status === "shipped";
  const canMarkPaid =
    order.order.category === "preorder" &&
    order.payment.balance > 0 &&
    order.order.status === "waiting_stock";
  const canFulfill =
    order.order.category === "preorder" &&
    order.payment.balance === 0 &&
    order.order.status === "waiting_stock";
  const canCancel =
    order.order.category === "preorder" &&
    order.order.status === "waiting_stock";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 opacity-50 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal Card */}
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900" id="modal-title">
              Order Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Basic Info */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Order Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">
                    {order.order.category}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {order.order.status.replace("_", " ")}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₱{order.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200 my-6" />

            {/* Customer Info */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Customer Information
              </h4>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Name:</span>{" "}
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span>{" "}
                  {order.customer.email}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Phone:</span>{" "}
                  {order.customer.phone}
                </p>
              </div>
            </div>

            <hr className="border-gray-200 my-6" />

            {/* Delivery Info */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Delivery Information
              </h4>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Method:</span>{" "}
                  {order.delivery.method}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Address:</span>{" "}
                  {order.delivery.address}
                </p>
              </div>
            </div>

            <hr className="border-gray-200 my-6" />

            {/* Items */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Order Items
              </h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        ₱{item.priceAtPurchase.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-200 my-6" />

            {/* Payment Info */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Payment Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {order.payment.status.replace("_", " ")}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Amount Paid</p>
                  <p className="font-medium text-gray-900">
                    ₱{order.payment.amountPaid.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Balance Due</p>
                  <p
                    className={`font-medium ${order.payment.balance > 0 ? "text-rose-600" : "text-green-600"}`}
                  >
                    ₱{order.payment.balance.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Refunded</p>
                  <p className="font-medium text-gray-900">
                    ₱{order.payment.refundAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200 my-6" />

            {/* Admin Actions */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Admin Actions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {canMarkPaid && (
                  <button
                    onClick={() => onMarkPaid(order.id)}
                    className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Mark Balance as Paid
                  </button>
                )}
                {canFulfill && (
                  <button
                    onClick={() => onFulfill(order.id)}
                    className="w-full py-2.5 px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    Fulfill Preorder
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={() => onCancel(order.id)}
                    className="w-full py-2.5 px-4 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
                  >
                    Cancel Preorder
                  </button>
                )}
                {canShip && (
                  <button
                    onClick={() => onShip(order.id)}
                    className="w-full py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Mark as Shipped
                  </button>
                )}
                {canComplete && (
                  <button
                    onClick={() => onComplete(order.id)}
                    className="w-full py-2.5 px-4 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;
