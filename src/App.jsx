import "./App.css";
import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
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
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
const App = () => {
  // Sử dụng useNavigate để điều hướng trang
  const navigate = useNavigate();

  // Lấy token và refreshToken từ local storage
  const token = window.localStorage.getItem("TOKEN");
  const refreshToken = localStorage.getItem("REFRESH_TOKEN");

  // Sử dụng state để lưu thông tin giải mã từ token và trạng thái đã giải mã token hay chưa
  const [hasDecodedToken, setHasDecodedToken] = useState(false);
  const [decodedPayloadToken, setDecodedPayloadToken] = useState(null);
  // Hàm để giải mã token và thiết lập decodedPayload

  const getDecodedPayload = async () => {
    if (token && !hasDecodedToken) {
      const decodedToken = decodeToken(token);

      if (decodedToken) {
        setDecodedPayloadToken(decodedToken);
        setHasDecodedToken(true);
      }
      if (decodedToken.exp < Date.now() / 1000) {
        // Sử dụng decodedToken.exp thay vì decodedPayloadToken.exp
        if (!refreshToken) {
          localStorage.removeItem("TOKEN");
          navigate("/login");
          return;
        }
        const decodedPayloadRefreshToken = decodeToken(refreshToken);
        if (decodedPayloadRefreshToken.exp >= Date.now() / 1000) {
          try {
            const res = await axiosClient.post(`auth/refesh-token`, {
              refreshToken,
            });

            const newToken = res.data.token;
            localStorage.setItem("TOKEN", newToken);
            axiosClient.defaults.headers.Authorization = `Bearer ${newToken}`;
          } catch (error) {
            console.error("Error refreshing token:", error);
          }
        } else {
          localStorage.removeItem("TOKEN");
          localStorage.removeItem("REFRESH_TOKEN");
          navigate("/login");
        }
      } else {
        axiosClient.defaults.headers.Authorization = `Bearer ${token}`;
      }
    }
  };

  // Sử dụng useEffect để gọi getDecodedPayload khi component được render
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (!token) {
      if (currentPath === "/forgot-password") {
        navigate("/forgot-password");
      } else {
        navigate("/login");
      }
    } else {
      const fetchData = async () => {
        await getDecodedPayload();
        setHasDecodedToken(false);
      };

      fetchData();
    }
  }, [token, navigate]);

  return (
    <>
      <Routes>
        {token && decodedPayloadToken ? (
          <Route
            path="/"
            element={
              <Layout
                userRole={decodedPayloadToken.typeRole}
                userAvatar={decodedPayloadToken.avatar}
                userLastName={decodedPayloadToken.lastName}
                userFirstName={decodedPayloadToken.firstName}
              />
            }
          >
            {decodedPayloadToken &&
              decodedPayloadToken.typeRole === "MANAGE" && (
                <>
                  <Route
                    index
                    element={
                      <StatisticalPage role={decodedPayloadToken.typeRole} />
                    }
                  />
                  <Route path="/orders" element={<OrderPage />} />
                  <Route path="/orders/:id" element={<DetailOrderPage />} />
                  <Route path="/products" element={<ProductPage />} />
                  <Route path="/categories" element={<CategoryPage />} />
                  <Route path="/employees" element={<EmployeePage />} />
                  <Route path="/customers" element={<CustomerPage />} />
                  <Route path="/suppliers" element={<SupplierPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                </>
              )}
            {decodedPayloadToken &&
              decodedPayloadToken.typeRole === "SALES" && (
                <>
                  <Route
                    index
                    element={
                      <StatisticalPage role={decodedPayloadToken.typeRole} />
                    }
                  />
                  <Route path="/create-order" element={<CreateOrder />} />
                  <Route
                    path="/pending-orders"
                    element={
                      <PendingOrderPage role={decodedPayloadToken.typeRole} />
                    }
                  />
                  <Route
                    path="/orders-me"
                    element={
                      <OrderMePage role={decodedPayloadToken.typeRole} />
                    }
                  />
                  <Route path="/orders/:id" element={<DetailOrderPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                </>
              )}
            {decodedPayloadToken &&
              decodedPayloadToken.typeRole === "SHIPPER" && (
                <>
                  <Route
                    index
                    element={
                      <StatisticalPage role={decodedPayloadToken.typeRole} />
                    }
                  />
                  <Route path="/account" element={<AccountPage />} />
                  <Route
                    path="/pending-orders"
                    element={
                      <PendingOrderPage role={decodedPayloadToken.typeRole} />
                    }
                  />
                  <Route path="/orders/:id" element={<DetailOrderPage />} />
                  <Route
                    path="/orders-me"
                    element={
                      <OrderMePage role={decodedPayloadToken.typeRole} />
                    }
                  />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                </>
              )}
          </Route>
        ) : (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </>
        )}
      </Routes>
    </>
  );
};

export default App;
