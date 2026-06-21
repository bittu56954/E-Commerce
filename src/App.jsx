import * as ReactDOM from "react-dom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './App.css';
import Home from "./components/Home";
import About from "./components/About";
import Dashboard from "./components/Dashboard";
import Contacts from "./components/Contacts";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import Footer from "./components/Footer";
import AdminPanel from "./components/AdminPanel";
import OrderConfirmation from "./components/OrderConfirmation";
import Toast from "./components/Toast";
import DeveloperBadge from "./components/DeveloperBadge";

const PageLayout = ({ children, showFooter = true }) => (
  <div className="layout-canvas-wrapper">
    <Navbar />
    <div className="page-content-viewport">
      {children}
    </div>
    {showFooter && <Footer />}
    <DeveloperBadge />
    <Toast />
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <PageLayout showFooter={true}><Home /></PageLayout>
  },
  {
    path: "/about",
    element: <PageLayout showFooter={true}><About /></PageLayout>
  },
  {
    path: "/dashboard",
    element: <PageLayout showFooter={true}><Dashboard /></PageLayout>
  },
  {
    path: "/admin",
    element: <PageLayout showFooter={false}><AdminPanel /></PageLayout>
  },
  {
    path: "/contact",
    element: <PageLayout showFooter={true}><Contacts /></PageLayout>
  },
  {
    path: "/register",
    element: <PageLayout showFooter={false}><Register /></PageLayout>
  },
  {
    path: "/login",
    element: <PageLayout showFooter={false}><Login /></PageLayout>
  },
  {
    path: "/order-confirmation/:orderId",
    element: <PageLayout showFooter={true}><OrderConfirmation /></PageLayout>
  }
]);

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
