import Header from "../components/Header";
import { useLocation } from "react-router-dom";

/**
 * Auth shell. Header/Footer static.
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
