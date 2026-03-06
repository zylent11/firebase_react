import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import useProducts from "../hooks/useProducts";

function Home({ handleAddToCart }) {
  const { products, loading } = useProducts();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("");

  const now = new Date();

  // Extract unique categories
  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        products.flatMap(
          (product) => product.category?.map((cat) => cat.name) || [],
        ),
      ),
    ];
  }, [products]);

  // FILTER + SEARCH + SORT
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) =>
        product.category?.some((cat) => cat.name === selectedCategory),
      );
    }

    if (sortOption === "low-high") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "high-low") {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, sortOption]);

  // ✅ AFTER all hooks
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Books
          </h2>
          <p className="mt-2 text-gray-500">
            Explore our latest collection and exclusive preorders.
          </p>
        </div>

        {/* SEARCH + FILTER SECTION */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search books..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* CATEGORY FILTER */}
            <select
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* SORT */}
            <select
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const isSaleActive =
                product.sale &&
                product.sale.startAt?.toDate() <= now &&
                product.sale.endAt?.toDate() >= now;

              const isPreorder = !!product.preorder;
              const isPreorderActive =
                isPreorder && product.preorder.endAt?.toDate() >= now;

              const preorderSlotsLeft =
                product.preorder?.limit - product.preorder?.reserved;

              const isPreorderAvailable =
                isPreorderActive && preorderSlotsLeft > 0;

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* IMAGE & BADGES */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <Link
                      to={`/product/${product.id}`}
                      className="block w-full h-full"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* SALE BADGE */}
                    {isSaleActive && (
                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                        SALE
                      </span>
                    )}

                    {/* PREORDER BADGE */}
                    {isPreorderActive && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                        PREORDER
                      </span>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* CATEGORY TAG */}
                    {product.category && product.category.length > 0 && (
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {product.category.map((cat) => cat.name).join(", ")}
                        </span>
                      </div>
                    )}

                    <Link to={`/product/${product.id}`} className="block mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors">
                        {product.title}
                      </h4>
                    </Link>

                    {/* PRICE SECTION */}
                    <div className="mb-4">
                      {isSaleActive ? (
                        <div className="flex items-baseline space-x-2">
                          <span className="text-lg font-bold text-gray-900">
                            ₱{product.sale.salePrice}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ₱{product.price}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xl font-bold text-gray-900">
                          ₱{product.price}
                        </p>
                      )}
                      <p
                        className={`text-lg font-small py-2 rounded ${product.stock === 0 ? "text-red-500" : "text-gray-500"}`}
                      >
                        {product.stock === 0
                          ? "Out of Stock"
                          : `Stock: ${product.stock}`}
                      </p>
                    </div>

                    {/* ACTION AREA */}
                    <div className="mt-auto space-y-2">
                      {isPreorderActive ? (
                        isPreorderAvailable ? (
                          <>
                            <p className="text-xs text-gray-500 font-medium">
                              {preorderSlotsLeft} slots left
                            </p>
                            <button
                              className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                              onClick={() =>
                                navigate(`/preorder/${product.id}`)
                              }
                            >
                              Preorder Now
                            </button>
                          </>
                        ) : (
                          <button
                            className="w-full py-2.5 px-4 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed"
                            disabled
                          >
                            Preorder Sold Out
                          </button>
                        )
                      ) : (
                        <button
                          className={`w-full py-2.5 px-4 text-sm font-medium rounded-lg transition-colors ${
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
              );
            })
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No products found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
