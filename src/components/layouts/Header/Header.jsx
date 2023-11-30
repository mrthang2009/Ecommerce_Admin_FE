import { useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./Header.module.scss";
import Navigation from "../../Navigation/Navigation";
import { Dropdown } from "antd";
import { MenuOutlined, DownOutlined } from "@ant-design/icons";

import PropTypes from "prop-types";
import { Link } from "react-router-dom";
const Header = ({ typeRole, avatar, last_name }) => {
  const [navVisible, setNavVisible] = useState(true);
  const toggleNavVisibility = () => {
    setNavVisible(!navVisible);
    console.log('««««« navVisible »»»»»', navVisible);
  };
   // Sử dụng useNavigate để điều hướng trang
   const navigate = useNavigate();
  const handleLogout = () => {
    // Xóa token và refreshToken từ localStorage
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    // Điều hướng người dùng đến trang đăng nhập
    navigate("/login");
  };
  const items = [
    {
      key: "1",
      label: <Link to="/account">Thông tin cá nhân</Link>,
    },
    {
      key: "2",
      label: <span onClick={handleLogout}>Đăng xuất</span>,
    },
  ];

  return (
    <header>
      <div className={styles.header_middle}>
        <div className={styles.header_left}>
          <Link to="/" className={styles.header_logo}>
            <img
              src="https://statics.vincom.com.vn/http/vincom-ho/thuong_hieu/anh_logo/Jollibee.png/6ec6dd2b7a0879c9eb1b77a204436a30.webp"
              alt=""
            />
          </Link>
          <i onClick={toggleNavVisibility}>
            <MenuOutlined />
          </i>
        </div>
        <>
          <Dropdown
            menu={{
              items,
            }}
            placement="bottomRight"
            arrow
          >
            <div className={styles.header_right}>
              <img className={styles.avatar} src={avatar} alt="" />
              <p>{last_name}</p>
              <DownOutlined />
            </div>
          </Dropdown>
        </>
      </div>
      
      <nav className={`${styles.nav} ${navVisible ? styles.navVisible : ""}`}>
        <Navigation role={typeRole} />
      </nav>
    </header>
  );
};
Header.propTypes = {
  typeRole: PropTypes.string,
  avatar: PropTypes.string,
  last_name: PropTypes.string,
};

export default Header;
