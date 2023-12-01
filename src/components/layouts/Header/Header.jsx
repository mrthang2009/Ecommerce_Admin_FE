import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
} from "@ant-design/icons";
import Navigation from "../../Navigation/Navigation";
import PropTypes from "prop-types";

import styles from "./Header.module.scss";

const Header = ({ typeRole, avatar, lastName }) => {
  const location = useLocation();
  const [navVisible, setNavVisible] = useState(false);
  const toggleNavVisibility = () => setNavVisible(!navVisible);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    navigate("/login");
  };

  const menuItems = [
    {
      key: "1",
      label: <Link to="/account">Thông tin cá nhân</Link>,
    },
    {
      key: "2",
      label: <span onClick={handleLogout}>Đăng xuất</span>,
    },
  ];

  useEffect(() => {
    setNavVisible(false);
  }, [location.pathname]);

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
            {navVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          </i>
        </div>
        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
          arrow
        >
          <div className={styles.header_right}>
            <img className={styles.avatar} src={avatar} alt={avatar} />
            <p>{lastName}</p>
            <DownOutlined />
          </div>
        </Dropdown>
      </div>

      <nav className={`${styles.nav} ${navVisible ? styles.navVisible : ""}`}>
        <Navigation role={typeRole}/>
      </nav>
    </header>
  );
};

Header.propTypes = {
  typeRole: PropTypes.string,
  avatar: PropTypes.string,
  lastName: PropTypes.string,
};

export default Header;
