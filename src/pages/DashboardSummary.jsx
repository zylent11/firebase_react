import { useMemo } from "react";

function DashboardSummary({ products }) {
  const stats = useMemo(() => {
    const totalProducts = products.length;

    const lowStock = products.filter((p) => p.stock > 0 && p.stock < 5).length;

    const outOfStock = products.filter((p) => p.stock === 0).length;

    const onSale = products.filter((p) => p.sale).length;

    const preorder = products.filter((p) => p.preorder).length;

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    products.forEach((product) => {
      const sold = product.soldCount || 0;

      const sellingPrice = product.sale?.salePrice || product.price || 0;

      const costPrice = product.cost || 0;

      totalRevenue += sellingPrice * sold;
      totalCost += costPrice * sold;
      totalProfit += (sellingPrice - costPrice) * sold;
    });

    return {
      totalProducts,
      lowStock,
      outOfStock,
      onSale,
      preorder,
      totalRevenue,
      totalCost,
      totalProfit,
    };
  }, [products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <StatCard title="Total Products" value={stats.totalProducts} />
      <StatCard title="Low Stock" value={stats.lowStock} />
      <StatCard title="Out of Stock" value={stats.outOfStock} />
      <StatCard title="On Sale" value={stats.onSale} />
      <StatCard title="Preorders" value={stats.preorder} />
      <StatCard
        title="Total Revenue"
        value={`₱ ${stats.totalRevenue.toLocaleString()}`}
      />

      <StatCard
        title="Total Cost"
        value={`₱ ${stats.totalCost.toLocaleString()}`}
      />

      <StatCard
        title="Total Profit"
        value={`₱ ${stats.totalProfit.toLocaleString()}`}
      />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

export default DashboardSummary;
