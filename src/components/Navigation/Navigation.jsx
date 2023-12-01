import PropTypes from "prop-types";
import { Menu, Card } from "antd";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
const Navigation = ({ role }) => {
  let items = [];
  if (role === "MANAGE") {
    items = [
      {
        key: "1",
        label: "Thống kê",
        path: "/",
      },
      {
        key: "2",
        label: "Đơn hàng",
        path: "/orders",
      },
      {
        key: "3",
        label: "Sản phẩm",
        path: "/products",
      },
      {
        key: "4",
        label: "Danh mục",
        path: "/categories",
      },
      {
        key: "5",
        label: "Khách hàng",
        path: "/customers",
      },
      {
        key: "6",
        label: "Nhà cung cấp",
        path: "/suppliers",
      },
      {
        key: "7",
        label: "Nhân viên",
        path: "/employees",
      },
    ];
  } else if (role === "SALES") {
    items = [
      {
        key: "1",
        label: "Thống kê cá nhân",
        path: "/",
      },
      {
        key: "2",
        label: "Tạo đơn hàng",
        path: "/create-order",
      },
      {
        key: "3",
        label: "Đơn hàng chờ xử lý",
        path: "/pending-orders",
      },
      {
        key: "4",
        label: "Đơn hàng của tôi",
        path: "/orders-me",
      },
    ];
  } else if (role === "SHIPPER") {
    items = [
      {
        key: "1",
        label: "Thống kê cá nhân",
        path: "/",
      },
      {
        key: "2",
        label: "Đơn hàng chờ xử lý",
        path: "/pending-orders",
      },
      {
        key: "3",
        label: "Đơn hàng của tôi",
        path: "/orders-me",
      },
    ];
  }
  const commonProfileMenu = [
    {
      key: "1",
      label: "Hồ sơ cá nhân",
      path: "/account",
    },
    {
      key: "2",
      label: "Thay đổi mật khẩu",
      path: "/change-password",
    },
  ];

  const isUserProfilePage =
    location.pathname === "/account" ||
    location.pathname === "/change-password";

  const displayMenu = isUserProfilePage ? commonProfileMenu : items;

  return (
    <>
      <Helmet>
        <title>
          {displayMenu.find((item) => item.path === location.pathname)?.label ||
            "Jollibee staff"}
        </title>
      </Helmet>
      <Card
        style={{
          width: 220,
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: "none", padding: 0 }}
          breakpoint="lg"
        >
          {displayMenu.map((item) => (
            <Menu.Item key={item.path} icon={item.icon}>
              <Link to={item.path}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </Card>
    </>
  );
};

Navigation.propTypes = {
  role: PropTypes.string,
};

export default Navigation;