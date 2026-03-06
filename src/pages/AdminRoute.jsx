import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID;

function AdminRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  // Still checking authentication
  if (user === undefined) {
    return <div>Checking authentication...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  // Logged in but not admin
  if (user.uid !== ADMIN_UID) {
    return <Navigate to="/" replace />;
  }

  // Admin access granted
  return children;
}

export default AdminRoute;
