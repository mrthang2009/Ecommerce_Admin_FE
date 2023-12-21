import { Form, Input, Button, message, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import axiosClient from "../libraries/axiosClient";
import { useEffect } from "react";
import styles from "./stylesPage/LoginPage.module.scss";
import { useState } from "react";
import { Helmet } from "react-helmet";

const LoginForm = () => {
  const [form] = Form.useForm();
  //Trạng thái loading của button
  const [loadings, setLoadings] = useState([false]);
  const [isRememberMe, setIsRememberMe] = useState(false);
  const navigate = useNavigate();
  // Lấy biến token từ nơi bạn đã lưu trữ nó nếu có
  const token = localStorage.getItem("TOKEN");
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [navigate, token]);

  const onFinish = async (values) => {
    try {
      setLoadings([true]);
      // Gửi yêu cầu đăng nhập đến máy chủ
      const url = "/auth/login";
      const res = await axiosClient.post(url, values);
      const { token, refreshToken } = res.data;

      // Lưu token vào Local Storage
      localStorage.setItem("TOKEN", token);
      if (isRememberMe) {
        localStorage.setItem("REFRESH_TOKEN", refreshToken);
      }

      axiosClient.defaults.headers.Authorization = `Bearer ${token}`;

      if (token) {
        navigate("/"); // Chuyển hướng đến trang chính sau khi đăng nhập thành công
        message.success("Đăng nhập thành công!"); // Hiển thị thông báo đăng nhập thành công
      } else {
        message.warning(
          "Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập."
        ); // Hiển thị thông báo đăng nhập thất bại
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi khi đăng nhập.");
      console.error("Lỗi đăng nhập:", error);
      setLoadings([false]);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Thất bại:", errorInfo);
  };

  return (
    <>
      <Helmet>
        <title>Đăng nhập</title>
      </Helmet>
      <div className="login-container">
        <Form
          layout="vertical"
          form={form}
          name="basic"
          wrapperCol={{
            span: 24,
          }}
          initialValues={{
            remember: false,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Email"
            name="email"
            style={{ marginBottom: "15px" }}
            autoComplete="off" // Tắt gợi ý nhập tự động
            rules={[
              {
                required: true,
                message: "Vui lòng nhập địa chỉ email!",
              },
              {
                type: "email",
                message: "Định dạng email không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Nhập địa chỉ email của bạn" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            style={{ marginBottom: "15px" }}
            autoComplete="off" // Tắt gợi ý nhập tự động
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu của bạn!",
              },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu của bạn" />
          </Form.Item>
          <a href="/forgot-password">Quên mật khẩu?</a>

          <Form.Item
            name="remember"
            style={{ marginBottom: "15px", textAlign: "center" }}
            valuePropName="checked"
          >
            <Checkbox onChange={(e) => setIsRememberMe(e.target.checked)}>
              Ghi nhớ đăng nhập
            </Checkbox>
          </Form.Item>
          <Form.Item style={{ textAlign: "center" }}>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                width: "60%",
                backgroundColor: "#E31837",
                color: "#ffffff",
              }}
              loading={loadings[0]}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

const LoginPage = () => {
  return (
    <main className={styles.background}>
      <div className={styles.box_login}>
        <div className={styles.logo}>
          <img
            src="https://statics.vincom.com.vn/http/vincom-ho/thuong_hieu/anh_logo/Jollibee.png/6ec6dd2b7a0879c9eb1b77a204436a30.webp"
            alt=""
          />
        </div>
        <LoginForm />
      </div>
    </main>
  );
};

export default LoginPage;
