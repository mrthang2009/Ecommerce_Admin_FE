import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
// import Footer from "../Footer/Footer";
import PropTypes from "prop-types";
const Layout = ({userRole, userAvatar, userLastName}) => {
  return (
    <>
      <Header typeRole={userRole} avatar={userAvatar} lastName={userLastName}/>
        <Outlet />
      {/* <Footer /> */}
    </>
  );
};
Layout.propTypes= {
  userRole: PropTypes.string,
  userAvatar: PropTypes.string,
  userLastName: PropTypes.string,
}

export default Layout;
