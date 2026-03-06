import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import useProduct from "../hooks/useProduct";

function ProductDetail({ handleAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading } = useProduct(id);

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

  // 🔥 Sale Logic
  const isSaleActive =
    product.sale &&
    product.sale.startAt?.toDate() <= now &&
    product.sale.endAt?.toDate() >= now;

  const displayPrice = isSaleActive ? product.sale.salePrice : product.price;

  // 🔥 Preorder Logic
  const isPreorder = !!product.preorder;

  const isPreorderActive =
    isPreorder && product.preorder.endAt?.toDate() >= now;

  const preorderSlotsLeft =
    product.preorder?.limit - product.preorder?.reserved;

  const isPreorderAvailable = isPreorderActive && preorderSlotsLeft > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-indigo-600 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{product.title}</li>
          </ol>
        </nav>

        {/* PRODUCT DETAIL CONTAINER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-10">
            {/* IMAGE SECTION */}
            <div className="flex flex-col">
              <div className="relative aspect-square lg:aspect-[4/3] rounded-lg overflow-hidden bg-white">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />

                {/* Badges */}
                {isSaleActive && (
                  <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg">
                    SALE
                  </span>
                )}

                {isPreorderActive && (
                  <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg">
                    PREORDER
                  </span>
                )}
              </div>
            </div>

            {/* DETAILS SECTION */}
            <div className="flex flex-col">
              {/* Title & Author */}
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">
                  {product.title}
                </h1>
                <p className="text-gray-500 text-lg">
                  By{" "}
                  <span className="font-medium text-gray-700">
                    {product.author}
                  </span>
                </p>
              </div>

              {/* Price Section */}
              <div className="mb-6">
                {isSaleActive ? (
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold text-gray-900">
                      ₱{product.sale.salePrice}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      ₱{product.price}
                    </span>
                    <span className="text-sm font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded">
                      Save ₱{product.price - product.sale.salePrice}
                    </span>
                  </div>
                ) : (
                  <h3 className="text-3xl font-bold text-gray-900">
                    ₱{product.price}
                  </h3>
                )}
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

              {/* Stock Info (if regular product) */}
              {!isPreorderActive && (
                <div className="mb-6">
                  <p
                    className={`text-sm font-medium ${
                      product.stock > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} units in stock`
                      : "Out of Stock"}
                  </p>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="mt-auto space-y-4">
                {isPreorderActive ? (
                  isPreorderAvailable ? (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-amber-800 mb-1">
                          {preorderSlotsLeft} slots left
                        </p>
                        <p className="text-sm text-amber-700">
                          Downpayment Required:{" "}
                          <span className="font-bold">
                            ₱{product.preorder.downpaymentAmount}
                          </span>
                        </p>
                      </div>

                      <button
                        className="w-full py-3 px-4 bg-indigo-600 text-white text-base font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                        onClick={() => navigate(`/preorder/${product.id}`)}
                      >
                        Preorder Now
                      </button>
                    </>
                  ) : (
                    <button
                      className="w-full py-3 px-4 bg-gray-100 text-gray-400 text-base font-medium rounded-lg cursor-not-allowed"
                      disabled
                    >
                      Preorder Sold Out
                    </button>
                  )
                ) : (
                  <button
                    className={`w-full py-3 px-4 text-base font-medium rounded-lg transition-colors shadow-sm ${
                      product.stock <= 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    }`}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
