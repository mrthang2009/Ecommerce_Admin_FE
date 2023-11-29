import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
// import Footer from "../Footer/Footer";
import PropTypes from "prop-types";
const Layout = ({userRole, avatar, last_name}) => {
  return (
    <>
      <Header typeRole= {userRole} avatar={avatar} last_name={last_name}/>
        <Outlet />
      {/* <Footer /> */}
    </>
  );
};
Layout.propTypes= {
  userRole: PropTypes.string,
  avatar: PropTypes.string,
  last_name: PropTypes.string,
}

export default Layout;
