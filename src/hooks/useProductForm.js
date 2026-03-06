import { useState, useEffect } from "react";
import {
  serverTimestamp,
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";

export default function useProductForm(onSuccess, productToEdit = null) {
  const [submitting, setSubmitting] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  // ✅ PREORDER
  const [hasPreorder, setHasPreorder] = useState(false);
  const [downpaymentAmount, setDownpaymentAmount] = useState("");
  const [preorderLimit, setPreorderLimit] = useState("");
  const [releaseDate, setReleaseDate] = useState("");

  // ✅ SALE
  const [hasSale, setHasSale] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [saleStart, setSaleStart] = useState("");
  const [saleEnd, setSaleEnd] = useState("");

  useEffect(() => {
    if (!productToEdit) return;

    setTitle(productToEdit.title || "");
    setAuthor(productToEdit.author || "");
    setDescription(productToEdit.description || "");
    setPrice(productToEdit.price || "");
    setStock(productToEdit.stock || "");
    setCost(productToEdit.cost || "");
    setSelectedCategories(productToEdit.category || []);

    // PREORDER
    if (productToEdit.preorder) {
      setHasPreorder(true);
      setDownpaymentAmount(productToEdit.preorder.downpaymentAmount || "");
      setPreorderLimit(productToEdit.preorder.limit || "");
      setReleaseDate(
        productToEdit.preorder.releaseDate?.toDate
          ? productToEdit.preorder.releaseDate
              .toDate()
              .toISOString()
              .slice(0, 16)
          : "",
      );
    }

    // SALE
    if (productToEdit.sale) {
      setHasSale(true);
      setSalePrice(productToEdit.sale.salePrice || "");
      setSaleStart(
        productToEdit.sale.startAt?.toDate
          ? productToEdit.sale.startAt.toDate().toISOString().slice(0, 16)
          : "",
      );
      setSaleEnd(
        productToEdit.sale.endAt?.toDate
          ? productToEdit.sale.endAt.toDate().toISOString().slice(0, 16)
          : "",
      );
    }
  }, [productToEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      const productData = {
        title,
        author,
        category: selectedCategories,
        cost: Number(cost),
        price: Number(price),
        stock: Number(stock),
        description,
        imageUrl: productToEdit?.imageUrl || "",
        updatedAt: serverTimestamp(),
      };

      if (hasPreorder) {
        if (!releaseDate) {
          alert("Please select a release date for preorder.");
          setSubmitting(false);
          return;
        }
        if (!downpaymentAmount || !preorderLimit) {
          alert("Please complete all preorder fields.");
          setSubmitting(false);
          return;
        }
        if (Number(downpaymentAmount) > Number(price)) {
          alert("Downpayment cannot exceed product price.");
          setSubmitting(false);
          return;
        }
        productData.preorder = {
          downpaymentAmount: Number(downpaymentAmount),
          limit: Number(preorderLimit),
          releaseDate: Timestamp.fromDate(new Date(releaseDate)),
          endAt: Timestamp.fromDate(new Date(releaseDate)),
          reserved: productToEdit?.preorder?.reserved || 0,
        };
      }

      if (hasSale) {
        if (!saleStart || !saleEnd) {
          alert("Please select sale start and end dates.");
          setSubmitting(false);
          return;
        }
        if (Number(salePrice) <= 0) {
          alert("Please enter a sale price.");
          setSubmitting(false);
          return;
        }
        if (Number(salePrice) >= Number(price)) {
          alert("Sale price must be lower than regular price.");
          setSubmitting(false);
          return;
        }
        if (new Date(saleEnd) <= new Date(saleStart)) {
          alert("Sale end date must be after sale start date.");
          setSubmitting(false);
          return;
        }
        productData.sale = {
          salePrice: Number(salePrice),
          startAt: Timestamp.fromDate(new Date(saleStart)),
          endAt: Timestamp.fromDate(new Date(saleEnd)),
          soldCount: productToEdit?.sale?.soldCount || 0,
        };
      }

      let docRef;

      if (productToEdit) {
        await updateDoc(doc(db, "products", productToEdit.id), productData);
        docRef = { id: productToEdit.id };
      } else {
        docRef = await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
          soldCount: 0,
        });
      }

      if (imageFile) {
        const imageRef = ref(storage, `products/${docRef.id}/cover`);
        await uploadBytes(imageRef, imageFile);
        const downloadURL = await getDownloadURL(imageRef);

        await updateDoc(doc(db, "products", docRef.id), {
          imageUrl: downloadURL,
        });
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Error creating product");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    submitting,

    imageFile,
    setImageFile,

    title,
    setTitle,

    author,
    setAuthor,

    selectedCategories,
    setSelectedCategories,

    cost,
    setCost,

    price,
    setPrice,

    stock,
    setStock,

    description,
    setDescription,

    // PREORDER
    hasPreorder,
    setHasPreorder,
    downpaymentAmount,
    setDownpaymentAmount,
    preorderLimit,
    setPreorderLimit,
    releaseDate,
    setReleaseDate,

    // SALE
    hasSale,
    setHasSale,
    salePrice,
    setSalePrice,
    saleStart,
    setSaleStart,
    saleEnd,
    setSaleEnd,

    handleSubmit,
  };
}
