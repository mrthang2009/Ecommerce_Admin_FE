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
import PendingOrderPage from"./pages/PendingOrderPage"
const App = () => {
  // Sử dụng useNavigate để điều hướng trang
  const navigate = useNavigate();

  // Lấy token từ local storage
  const token = localStorage.getItem("TOKEN");

  // Sử dụng state để lưu thông tin giải mã từ token và trạng thái đã giải mã token hay chưa
  const [decodedPayload, setDecodedPayload] = useState(null);
  const [hasDecodedToken, setHasDecodedToken] = useState(false);

  // Hàm để giải mã token và thiết lập decodedPayload
  const getDecodedPayload = () => {
    if (token && !hasDecodedToken) {
      // Giải mã token chỉ khi token tồn tại và chưa giải mã
      // Thiết lập token cho axiosClient để gửi trong mọi yêu cầu
      axiosClient.defaults.headers.Authorization = `Bearer ${token}`;
      const decodedPayload = decodeToken(token); // Sử dụng hàm decodeToken để giải mã token
      if (decodedPayload) {
        setDecodedPayload(decodedPayload);
        console.log('««««« decodedPayload »»»»»', decodedPayload);
        setHasDecodedToken(true); // Đánh dấu rằng đã giải mã token
      }
    } else if (!token) {
      // Nếu không có token, điều hướng đến trang đăng nhập
      navigate("/login");
    }
  };

  // Sử dụng useEffect để gọi getDecodedPayload khi component được render
  useEffect(() => {
    const fetchData = async () => {
      await getDecodedPayload();
      setHasDecodedToken(false);
    };
  
    fetchData();
  }, [token]);

  return (
    <>
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
            {decodedPayload && decodedPayload.typeRole === "MANAGE" && (
              <>
                <Route
                  index
                  element={<StatisticalPage role={decodedPayload.typeRole} />}
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
            {decodedPayload && decodedPayload.typeRole === "SALES" && (
              <>
                <Route
                  index
                  element={<StatisticalPage role={decodedPayload.typeRole} />}
                />
                <Route path="/create-order" element={<CreateOrder />} />
                <Route
                  path="/pending-orders"
                  element={<PendingOrderPage role={decodedPayload.typeRole}/>}
                />
                <Route
                  path="/orders-me"
                  element={<OrderMePage role={decodedPayload.typeRole} />}
                />
                <Route path="/orders/:id" element={<DetailOrderPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/change-password" element={<ChangePassword />} />
              </>
            )}
            {decodedPayload && decodedPayload.typeRole === "SHIPPER" && (
              <>
                <Route
                  index
                  element={<StatisticalPage role={decodedPayload.typeRole} />}
                />
                <Route path="/account" element={<AccountPage />} />
                <Route
                  path="/pending-orders"
                  element={<PendingOrderPage role={decodedPayload.typeRole}/>}
                />
                <Route path="/orders/:id" element={<DetailOrderPage />} />
                <Route
                  path="/orders-me"
                  element={<OrderMePage role={decodedPayload.typeRole} />}
                />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/change-password" element={<ChangePassword />} />
              </>
            )}
          </Route>
        ) : (
          <Route path="/login" element={<LoginPage />} />
        )}
      </Routes>
    </>
  );
};

export default App;
