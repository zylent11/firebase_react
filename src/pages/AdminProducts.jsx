import { useMemo, useState } from "react";
import AdminProductFilters from "./AdminProductFilters";
import useProducts from "../hooks/useProducts";
import { Link } from "react-router-dom";
import ProductList from "./ProductList";
import ProductFormModal from "./ProductFormModal";

function AdminProducts() {
  const { products, loading } = useProducts();
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (
        filters.search &&
        !product.title.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.category &&
        (!product.category || !product.category.includes(filters.category))
      ) {
        return false;
      }

      if (filters.status === "lowStock" && product.stock >= 5) {
        return false;
      }

      if (filters.status === "outOfStock" && product.stock > 0) {
        return false;
      }

      if (filters.status === "onSale" && !product.sale) {
        return false;
      }

      if (filters.status === "preorder" && !product.preorder) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  return (
    <div className="px-6">
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
      {/* FILTERS */}
      <div className="mb-8">
        <AdminProductFilters onFilterChange={setFilters} />
      </div>

      {/* PRODUCT LIST */}
      <ProductList
        products={filteredProducts}
        loading={loading}
        onEdit={handleEdit}
        // onDelete={handleDelete}
        // onView={handleView}
      />

      <ProductFormModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
      />
    </div>
  );
}

export default AdminProducts;
