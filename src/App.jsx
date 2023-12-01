import "./App.css";
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axiosClient from "./libraries/axiosClient";
import Layout from "./components/layouts/Layout/Layout";
import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import CreateOrder from "./pages/CreateOrder";
import decodeToken from "./libraries/tokenDecoding";
import EmployeePage from "./pages/EmployeePage";
import CustomerPage from "./pages/CustomerPage";
import SupplierPage from "./pages/SupplierPage";
import OrderPage from "./pages/OrderPage";
import AccountPage from "./pages/AccountPage";
import DetailOrderPage from "./pages/DetailOrderPage";
import OrderMePage from "./pages/OrderMePage";
import ChangePassword from "./pages/ChangePassword";
import StatisticalPage from "./pages/StatisticalPage";
import PendingOrderPage from "./pages/PendingOrderPage";

const App = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("TOKEN");
  const [decodedPayload, setDecodedPayload] = useState(null);

  const getDecodedPayload = () => {
    if (token && !decodedPayload) {
      axiosClient.defaults.headers.Authorization = `Bearer ${token}`;
      const decodedPayload = decodeToken(token);
      if (decodedPayload) {
        setDecodedPayload(decodedPayload);
      } else {
        navigate("/login");
      }
    } else if (!token) {
      navigate("/login");
    }
  };

  useEffect(() => {
    getDecodedPayload();
  }, [navigate, token, decodedPayload]);

  return (
    <Routes>
      {token && decodedPayload ? (
        <Route
          path="/"
          element={
            <Layout
              userRole={decodedPayload.typeRole}
              userAvatar={decodedPayload.avatar}
              userLastName={decodedPayload.lastName}
            />
          }
        >
          {decodedPayload && (
            <>
              {decodedPayload.typeRole === "MANAGE" && (
                <>
                  <Route index element={<StatisticalPage role={decodedPayload.typeRole} />} />
                  <Route path="/orders" element={<OrderPage />} />
                  <Route path="/orders/:id" element={<DetailOrderPage />} />
                  <Route path="/products" element={<ProductPage />} />
                  <Route path="/categories" element={<CategoryPage />} />
                  <Route path="/employees" element={<EmployeePage />} />
                  <Route path="/customers" element={<CustomerPage />} />
                  <Route path="/suppliers" element={<SupplierPage />} />
                </>
              )}
              {decodedPayload.typeRole === "SALES" && (
                <>
                  <Route index element={<StatisticalPage role={decodedPayload.typeRole} />} />
                  <Route path="/create-order" element={<CreateOrder />} />
                  <Route path="/pending-orders" element={<PendingOrderPage role={decodedPayload.typeRole} />} />
                  <Route path="/orders-me" element={<OrderMePage role={decodedPayload.typeRole} />} />
                  <Route path="/orders/:id" element={<DetailOrderPage />} />
                </>
              )}
              {decodedPayload.typeRole === "SHIPPER" && (
                <>
                  <Route index element={<StatisticalPage role={decodedPayload.typeRole} />} />
                  <Route path="/pending-orders" element={<PendingOrderPage role={decodedPayload.typeRole} />} />
                  <Route path="/orders/:id" element={<DetailOrderPage />} />
                  <Route path="/orders-me" element={<OrderMePage role={decodedPayload.typeRole} />} />
                </>
              )}
              <Route path="/account" element={<AccountPage />} />
              <Route path="/change-password" element={<ChangePassword />} />
            </>
          )}
        </Route>
      ) : (
        <Route path="/login" element={<LoginPage />} />
      )}
    </Routes>
  );
};

export default App;
