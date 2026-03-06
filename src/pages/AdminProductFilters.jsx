import { useState, useEffect } from "react";

function AdminProductFilters({ onFilterChange }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    onFilterChange({
      search,
      status,
    });
  }, [search, status]);

  function handleReset() {
    setSearch("");
    setStatus("");
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 🔍 Search */}
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-full"
        />

        {/* 📦 Status Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-full"
        >
          <option value="">All Status</option>
          <option value="lowStock">Low Stock (&lt; 5)</option>
          <option value="outOfStock">Out of Stock</option>
          <option value="onSale">On Sale</option>
          <option value="preorder">Preorder</option>
        </select>

        {/* 🔄 Reset */}
        <button
          onClick={handleReset}
          className="bg-gray-400 hover:bg-gray-300 text-sm rounded-lg px-4 py-2"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default AdminProductFilters;
