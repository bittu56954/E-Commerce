import * as ReactDOM from "react-dom";
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import './App.css'
import Home from "./components/Home";
import About from "./components/About";
import Dashboard from "./components/Dashboard";
import Contacts from "./components/Contacts";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import Footer from "./components/Footer";

const router = createBrowserRouter([
  {
    path:"/",
    element:
    <div>
      <Navbar/>
      <Home/>
      <Footer/>
    </div>
  },
  {
    path:"/about",
    element:
    <div>
      <Navbar/>
      <About/>
    </div>

  },
  {
    path:"/dashboard",
    element:
    <div>
      <Navbar/>
      <Dashboard/>
    </div>
  },
  {
    path:"/contact",
    element:
    <div>
      <Navbar/>
      <Contacts/>
    </div>
  },

   {
    path:"/register",
    element:
    <div>
      <Navbar/>
      <Register/>
    </div>
  },

   {
    path:"/login",
    element:
    <div>
      <Navbar/>
     <Login/>
    </div>
  }
])

function App() {
 

  return (
    <div>
<RouterProvider router={router} />
    </div>
  )
}

export default App
