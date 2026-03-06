import ProductFormModal from "./ProductFormModal";
import { useState } from "react";
function ProductList({ products, loading, onEdit, onDelete, onView }) {
  const [showModal, setShowModal] = useState(false);
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Product List</h3>
      <button
        onClick={() => setShowModal(true)}
        className="bg-indigo-600 text-white font-semibold my-2 px-4 py-2 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-200"
      >
        + Add Product
      </button>

      <ProductFormModal show={showModal} onClose={() => setShowModal(false)} />

      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
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
            No products found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Start adding products to your inventory.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Pricing
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Inventory
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const now = new Date();

                  const isSaleActive =
                    product.sale &&
                    product.sale.startAt?.toDate() <= now &&
                    product.sale.endAt?.toDate() >= now;

                  const isPreorderActive =
                    product.preorder &&
                    product.preorder.reserved < product.preorder.limit;
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Product Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="h-12 w-12 flex-shrink-0">
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="h-12 w-12 rounded-lg object-cover border"
                            />
                          </div>

                          <div className="ml-4 min-w-0">
                            <div className="text-sm font-medium text-gray-900 break-words">
                              {product.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              By {product.author || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isSaleActive ? (
                          <>
                            <div className="text-sm font-bold text-blue-600">
                              ₱{product.sale.salePrice.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 line-through">
                              ₱{product.price.toLocaleString()}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm font-bold text-gray-900">
                            ₱{product.price.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Inventory */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">Stock:</span>{" "}
                          {product.stock}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Sold:</span>{" "}
                          {product.soldCount || 0}
                        </div>
                        {product.preorder && (
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Reserved:</span>{" "}
                            {product.preorder.reserved}
                          </div>
                        )}
                      </td>

                      {/* Status Indicators */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {/* Stock Status */}
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">Stock:</span>{" "}
                            <span
                              className={
                                product.stock === 0
                                  ? "text-red-600 font-semibold"
                                  : product.stock <= 5
                                    ? "text-yellow-600 font-semibold"
                                    : "text-green-600 font-semibold"
                              }
                            >
                              {product.stock}
                            </span>
                          </div>

                          {/* Sale Status */}
                          {isSaleActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              On Sale
                            </span>
                          )}

                          {/* Preorder Status */}
                          {isPreorderActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Preorder
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {onView && (
                            <button
                              onClick={() => onView(product.id)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                              title="View"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(product)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(product.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
