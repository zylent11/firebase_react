import useCategories from "../hooks/useCategories";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  serverTimestamp,
  Timestamp,
  collection,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db, storage } from "../firebase/config";
import useProducts from "../hooks/useProducts";

function AdminDashboard() {
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const categories = useCategories();

  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  // preorder
  const [hasPreorder, setHasPreorder] = useState(false);
  const [downpaymentAmount, setDownpaymentAmount] = useState("");
  const [preorderLimit, setPreorderLimit] = useState("");
  const [releaseDate, setReleaseDate] = useState("");

  // sale (optional for later)
  const [hasSale, setHasSale] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [saleStart, setSaleStart] = useState("");
  const [saleEnd, setSaleEnd] = useState("");

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/admin-login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async function handleAddProduct(e) {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);

      if (!imageFile) {
        alert("Please upload an image");
        return;
      }

      // Base product data
      const productData = {
        title,
        author,
        category: selectedCategories,
        cost: Number(cost),
        price: Number(price),
        stock: Number(stock),
        description,
        imageUrl: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        soldCount: 0,
      };

      // PREORDER
      if (hasPreorder) {
        productData.preorder = {
          downpaymentAmount: Number(downpaymentAmount),
          limit: Number(preorderLimit),
          releaseDate: Timestamp.fromDate(new Date(releaseDate)),
          reserved: 0,
          soldCount: 0,
        };
      } else {
        productData.preorder = null;
      }

      // SALE
      if (hasSale) {
        productData.sale = {
          salePrice: Number(salePrice),
          startAt: Timestamp.fromDate(new Date(saleStart)),
          endAt: Timestamp.fromDate(new Date(saleEnd)),
          soldCount: 0,
        };
      } else {
        productData.sale = null;
      }

      // 1️⃣ Create product first
      const docRef = await addDoc(collection(db, "products"), productData);

      // 2️⃣ Upload image
      const imageRef = ref(storage, `products/${docRef.id}/cover`);
      await uploadBytes(imageRef, imageFile);

      const downloadURL = await getDownloadURL(imageRef);

      // 3️⃣ Update imageUrl
      await updateDoc(doc(db, "products", docRef.id), {
        imageUrl: downloadURL,
      });

      alert("Product created successfully!");

      // Reset everything
      setTitle("");
      setAuthor("");
      setSelectedCategories([]);
      setCost("");
      setPrice("");
      setStock("");
      setDescription("");
      setImageFile(null);

      setHasPreorder(false);
      setDownpaymentAmount("");
      setPreorderLimit("");
      setReleaseDate("");

      setHasSale(false);
      setSalePrice("");
      setSaleStart("");
      setSaleEnd("");

      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert("Error creating product");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        background: "transparent",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Admin Dashboard</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "#4f46e5",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            + Add Product
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              width: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginBottom: "15px" }}>Add New Product</h3>

            <form onSubmit={handleAddProduct}>
              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                placeholder="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />

              <div style={{ marginTop: "15px" }}>
                <p>
                  <strong>Categories:</strong>
                </p>

                {categories.map((cat) => (
                  <label key={cat.id} style={{ display: "block" }}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => handleCategoryChange(cat.id)}
                    />
                    {cat.name}
                  </label>
                ))}
              </div>

              <input
                placeholder="Cost"
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />

              <input
                placeholder="Price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <input
                placeholder="Stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              {imageFile && (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  style={{ width: "100px", marginTop: "10px" }}
                />
              )}

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <hr style={{ margin: "20px 0" }} />

              <label>
                <input
                  type="checkbox"
                  checked={hasPreorder}
                  onChange={() => setHasPreorder(!hasPreorder)}
                />
                Enable Preorder
              </label>

              {hasPreorder && (
                <>
                  <input
                    type="number"
                    placeholder="Downpayment Amount"
                    value={downpaymentAmount}
                    onChange={(e) => setDownpaymentAmount(e.target.value)}
                  />

                  <input
                    type="number"
                    placeholder="Preorder Limit"
                    value={preorderLimit}
                    onChange={(e) => setPreorderLimit(e.target.value)}
                  />

                  <input
                    type="datetime-local"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                  />
                </>
              )}

              <hr style={{ margin: "20px 0" }} />

              <label>
                <input
                  type="checkbox"
                  checked={hasSale}
                  onChange={() => setHasSale(!hasSale)}
                />
                Enable Sale
              </label>

              {hasSale && (
                <>
                  <input
                    type="number"
                    placeholder="Sale Price"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                  />

                  <input
                    type="datetime-local"
                    value={saleStart}
                    onChange={(e) => setSaleStart(e.target.value)}
                  />

                  <input
                    type="datetime-local"
                    value={saleEnd}
                    onChange={(e) => setSaleEnd(e.target.value)}
                  />
                </>
              )}

              <div style={{ marginTop: "15px" }}>
                <button
                  disabled={submitting}
                  type="submit"
                  style={{
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                >
                  {submitting ? "Saving..." : "Save Product"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#ccc",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <h3 style={{ marginTop: "30px" }}>Product List</h3>
      {loading && <p>Loading products...</p>}
      {products.map((product) => (
        <div
          key={product.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            padding: "10px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{ width: "60px", height: "60px", objectFit: "cover" }}
          />

          <div style={{ flex: 1 }}>
            <p>
              <strong>{product.title}</strong>
            </p>
            <p>₱{product.price}</p>
            <p>Stock: {product.stock}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;
