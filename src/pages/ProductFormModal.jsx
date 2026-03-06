// THIS IS ADMIN PRODUCT ADD FORM
// THIS IS ADMIN PRODUCT ADD FORM
// THIS IS ADMIN PRODUCT ADD FORM
// THIS IS ADMIN PRODUCT ADD FORM
// THIS IS ADMIN PRODUCT ADD FORM
// THIS IS ADMIN PRODUCT ADD FORM

import useCategories from "../hooks/useCategories";
import useProductForm from "../hooks/useProductForm";

function ProductFormModal({ show, onClose, productToEdit }) {
  const categories = useCategories();

  const form = useProductForm(() => {
    alert(productToEdit ? "Product updated!" : "Product created!");
    onClose();
  }, productToEdit);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 opacity-75 transition-opacity"
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
              Add New Product
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
          <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
            <form onSubmit={form.handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Basic Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="Book Title"
                      value={form.title}
                      onChange={(e) => form.setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      placeholder="Author Name"
                      value={form.author}
                      onChange={(e) => form.setAuthor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Product description"
                    rows={4}
                    value={form.description}
                    onChange={(e) => form.setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Categories */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Categories
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const isChecked = form.selectedCategories.some(
                      (selected) => selected.id === cat.id,
                    );

                    return (
                      <label
                        key={cat.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          isChecked
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            form.setSelectedCategories((prev) => {
                              const alreadySelected = prev.some(
                                (selected) => selected.id === cat.id,
                              );

                              if (alreadySelected) {
                                return prev.filter(
                                  (selected) => selected.id !== cat.id,
                                );
                              }

                              return [...prev, { id: cat.id, name: cat.name }];
                            });
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {cat.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Pricing & Stock */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Pricing & Stock
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.cost}
                      onChange={(e) => form.setCost(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) => form.setPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.stock}
                      onChange={(e) => form.setStock(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Image Upload */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Product Image
                </h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => form.setImageFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
                {form.imageFile && (
                  <div className="mt-4">
                    <img
                      src={URL.createObjectURL(form.imageFile)}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              <hr className="border-gray-200" />

              {/* Preorder Settings */}
              <div>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={form.hasPreorder}
                    onChange={(e) => form.setHasPreorder(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Enable Preorder
                  </label>
                </div>

                {form.hasPreorder && (
                  <div className="space-y-4 pl-6 border-l-2 border-indigo-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Downpayment Amount
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={form.downpaymentAmount}
                        onChange={(e) =>
                          form.setDownpaymentAmount(e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preorder Limit
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.preorderLimit}
                        onChange={(e) => form.setPreorderLimit(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Release Date
                      </label>
                      <input
                        type="datetime-local"
                        value={form.releaseDate}
                        onChange={(e) => form.setReleaseDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-gray-200" />

              {/* Sale Settings */}
              <div>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={form.hasSale}
                    onChange={(e) => form.setHasSale(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Enable Sale
                  </label>
                </div>

                {form.hasSale && (
                  <div className="space-y-4 pl-6 border-l-2 border-rose-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Price
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={form.salePrice}
                        onChange={(e) => form.setSalePrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sale Start
                        </label>
                        <input
                          type="datetime-local"
                          value={form.saleStart}
                          onChange={(e) => form.setSaleStart(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sale End
                        </label>
                        <input
                          type="datetime-local"
                          value={form.saleEnd}
                          onChange={(e) => form.setSaleEnd(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={form.submitting}
                  type="submit"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    form.submitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                >
                  {form.submitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductFormModal;
