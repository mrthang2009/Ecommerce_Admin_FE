import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
// import Footer from "../Footer/Footer";
import PropTypes from "prop-types";
const Layout = ({ userRole, userAvatar, userLastName, userFirstName}) => {
  return (
    <>
      <Header
        typeRole={userRole}
        avatar={userAvatar}
        lastName={userLastName}
        firstName={userFirstName}
      />
      <Outlet />
      {/* <Footer /> */}
    </>
  );
};
Layout.propTypes = {
  userRole: PropTypes.string,
  userAvatar: PropTypes.string,
  userLastName: PropTypes.string,
  userFirstName: PropTypes.string,
};

export default Layout;
