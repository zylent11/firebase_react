import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import useProduct from "../hooks/useProduct";

function PreorderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading } = useProduct(id);

  const [quantity, setQuantity] = useState(1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const now = new Date();

  const isPreorderActive =
    product.preorder && product.preorder.endAt?.toDate() >= now;

  if (!isPreorderActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-amber-800 mb-2">
              Preorder Period Ended
            </h2>
            <p className="text-amber-700 mb-4">
              This product is no longer available for preorder.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const slotsLeft = product.preorder.limit - product.preorder.reserved;

  if (slotsLeft <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Preorder Sold Out
            </h2>
            <p className="text-red-700 mb-4">
              All preorder slots have been reserved.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = product.price * quantity;
  const downpaymentTotal = product.preorder.downpaymentAmount * quantity;

  const handleIncrease = () => {
    if (quantity < slotsLeft) setQuantity(quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleProceed = () => {
    navigate("/checkout", {
      state: {
        orderType: "preorder",
        productId: product.id,
        quantity,
      },
    });
  };

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
            <li className="text-gray-900 font-medium">Preorder</li>
          </ol>
        </nav>

        {/* PREORDER CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* IMAGE SECTION */}
            <div className="bg-gray-100 p-6 lg:p-10 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden shadow-md">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg">
                  PREORDER
                </div>
              </div>
            </div>

            {/* DETAILS SECTION */}
            <div className="p-6 lg:p-10 flex flex-col">
              {/* Title & Author */}
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words">
                  {product.title}
                </h1>
                <p className="text-gray-500 text-lg">
                  By{" "}
                  <span className="font-medium text-gray-700">
                    {product.author}
                  </span>
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                  Description
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price Box */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    <strong>Regular Price:</strong>
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ₱{product.price}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    <strong>Downpayment per copy:</strong>
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ₱{product.preorder.downpaymentAmount}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-amber-700 font-medium">
                    <strong>Slots Remaining:</strong>
                  </span>
                  <span className="text-amber-700 font-bold">{slotsLeft}</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold text-gray-900 w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    disabled={quantity >= slotsLeft}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Maximum {slotsLeft} units available
                </p>
              </div>

              {/* Summary Box */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">
                    Total Price:
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    ₱{totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-indigo-200">
                  <span className="text-indigo-800 font-bold">
                    Required Downpayment:
                  </span>
                  <span className="text-xl font-bold text-indigo-900">
                    ₱{downpaymentTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="w-full py-3 px-4 bg-indigo-600 text-white text-base font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                onClick={handleProceed}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreorderPage;
