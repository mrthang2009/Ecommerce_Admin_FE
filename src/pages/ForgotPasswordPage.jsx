import { Form, Input, Button, message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import axiosClient from "../libraries/axiosClient";
import { useEffect } from "react";
import styles from "./stylesPage/ForgotPasswordPage.module.scss";
import { useState } from "react";
import { Helmet } from "react-helmet";

const ResetPasswordForm = () => {
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [loadings, setLoadings] = useState({
    resetPassword: false,
    resendCode: false,
    verifyEmail: false,
  });
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("TOKEN");
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [navigate, token]);

  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const onFinish = async (values) => {
    try {
      setLoadings((prevLoadings) => ({ ...prevLoadings, resetPassword: true }));
      setFormData({
        email: values.email,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      await axiosClient.post("/auth/send-code", {
        email: values.email,
        forgotPassword: true,
      });
      setShowVerificationModal(true);
      message.warning("Vui lòng nhập mã xác thực được gửi đến email của bạn");
      setLoadings((prevLoadings) => ({
        ...prevLoadings,
        resetPassword: false,
      }));
    } catch (error) {
      message.error("Đã xảy ra lỗi khi đặt lại mật khẩu");
      console.error("Lỗi đặt lại mật khẩu:", error);
      setLoadings((prevLoadings) => ({
        ...prevLoadings,
        resetPassword: false,
      }));
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Thất bại:", errorInfo);
  };

  const hideEmail = (email) => {
    const atIndex = email.indexOf("@");
    if (atIndex > 1) {
      const visiblePart = email.substring(0, 1) + "*".repeat(atIndex - 1);
      const hiddenPart = email.substring(atIndex);
      return visiblePart + hiddenPart;
    } else {
      return email;
    }
  };

  const handleVerificationSubmit = async () => {
    try {
      setLoadings((prevLoadings) => ({
        ...prevLoadings,
        verifyEmail: true,
      }));

      const values = await modalForm.validateFields();

      const response = await axiosClient.post("/auth/forgot-password", {
        email: formData.email,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
        enteredCode: values.verificationCode,
      });

      if (!response.data.payload) {
        message.error(response.data.message);
      } else {
        setShowVerificationModal(false);
        navigate("/login");
        message.success("Đặt lại mật khẩu thành công!");
      }

      setLoadings((prevLoadings) => ({
        ...prevLoadings,
        verifyEmail: false,
      }));
    } catch (error) {
      setLoadings((prevLoadings) => ({
        ...prevLoadings,
        verifyEmail: false,
      }));
      console.error(error);
      message.error("Xác thực email thất bại. Vui lòng thử lại.");
    }
  };

  const handleResendCode = async () => {
    try {
      setLoadings((prevLoadings) => ({ ...prevLoadings, resendCode: true }));

      await axiosClient.post("/auth/send-code", {
        email: formData.email,
        forgotPassword: true,
      });

      setShowVerificationModal(true);
      message.warning("Mã xác thực mới đã được gửi đến email của bạn");
      setLoadings((prevLoadings) => ({
        ...prevLoadings,
        resendCode: false,
      }));
    } catch (error) {
      message.error("Đã xảy ra lỗi khi gửi lại mã xác thực");
      console.error("Lỗi gửi mã xác thực:", error);
      setLoadings((prevLoadings) => ({
        ...prevLoadings,
        resendCode: false,
      }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Đặt lại mật khẩu</title>
      </Helmet>
      <div className="login-container">
        <Form
          form={form}
          name="basic"
          layout="vertical"
          autoComplete="off"
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
            autoComplete="off"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập địa chỉ email",
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
            name="newPassword"
            style={{ marginBottom: "15px" }}
            autoComplete="off"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu của bạn",
              },
              {
                pattern: /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                message:
                  "Mật khẩu không hợp lệ! Phải có ít nhất 8 ký tự, bao gồm một chữ hoa và một ký tự đặc biệt.",
              },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu của bạn" />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            style={{ marginBottom: "15px" }}
            autoComplete="off"
            dependencies={["newPassword"]}
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận mật khẩu mới",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Mật khẩu xác nhận không khớp");
                },
              }),
            ]}
          >
            <Input.Password placeholder="Xác nhận lại mật khẩu của bạn" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                width: "50%",
                backgroundColor: "#E31837",
                color: "#ffffff",
                marginTop: "20px",
              }}
              loading={loadings.resetPassword}
            >
              Đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
        <Modal
          width={500}
          title="Xác thực email"
          open={showVerificationModal}
          onCancel={() => setShowVerificationModal(false)}
          footer={null}
          centered
        >
          <p style={{ marginBottom: "20px" }}>
            Mã xác thực đã được gửi đến email {hideEmail(formData.email)}. Vui
            lòng nhập mã xác thực email để hoàn thành đặt lại mật khẩu.
          </p>

          <Form
            form={modalForm}
            name="basic"
            autoComplete="off"
            initialValues={{
              remember: false,
            }}
            onFinish={handleVerificationSubmit}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              name="verificationCode"
              style={{ marginBottom: "15px" }}
              autoComplete="off"
              wrapperCol={{
                span: 10,
              }}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mã xác thực",
                },
              ]}
            >
              <Input placeholder="Nhập mã xác thực của bạn" />
            </Form.Item>

            <Button
              loading={loadings.resendCode}
              onClick={handleResendCode}
              type="link"
              style={{ padding: "0px" }}
            >
              Gửi lại mã xác thực
            </Button>
            <Form.Item>
              <Button
                type="primary"
                style={{
                  width: "40%",
                  backgroundColor: "#E31837",
                  color: "#ffffff",
                }}
                htmlType="submit"
                loading={loadings.verifyEmail}
              >
                Xác thực email
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

const ForgotPasswordPage = () => {
  return (
    <main className={styles.background}>
      <div className={styles.box_reset}>
        <div className={styles.logo}>
          <img
            src="https://statics.vincom.com.vn/http/vincom-ho/thuong_hieu/anh_logo/Jollibee.png/6ec6dd2b7a0879c9eb1b77a204436a30.webp"
            alt=""
          />
        </div>
        <ResetPasswordForm />
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
