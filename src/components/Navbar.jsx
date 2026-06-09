import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <div>
      <ul>
        
        <div className="logo-container">
          <img 
            src="https://oca.asia/media/cache/74/5a/745ae8597ccfe297dab61c0dda943aa4.jpg"
            alt="Flag" 
            style={{ height: '45px', width: '85px', borderRadius: '6px', objectFit: 'cover' }}
          />
          <h2 style={{ color: 'white', margin: 0, fontSize: '22px' }}>India</h2>
        </div>

       
        <div className="links-container">
          <li>
            <NavLink className='box' to='/'>Home</NavLink>
          </li>
          <li>
            <NavLink className='box' to='/about'>About</NavLink>
          </li>
          <li>
            <NavLink className='box' to='/dashboard'>Dashboard</NavLink>
          </li>
          <li>
            <NavLink className='box' to='/contact'>Contact</NavLink>
          </li>
          <li>
            <NavLink className='box' to='/register'>Register</NavLink>
          </li>
          <li>
            <NavLink className='box' to='/login'>Login</NavLink>
          </li>
        </div>

      </ul>
    </div>
  );
}

export default Navbar;