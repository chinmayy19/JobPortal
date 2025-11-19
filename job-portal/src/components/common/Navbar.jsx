import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0'}}>
        <Link to="/" style={{fontWeight:800,fontSize:20,color:'var(--text)'}}>JobPortal</Link>

        <div style={{display:'flex',gap:18,alignItems:'center'}}>
          <Link to="/jobs" style={{color:'var(--muted)'}}>Jobs</Link>
          <Link to="/login" style={{color:'var(--muted)'}}>Login</Link>
          <Link to="/register" className="btn">Register</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
