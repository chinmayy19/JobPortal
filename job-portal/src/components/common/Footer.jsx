import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>© {new Date().getFullYear()} JobPortal</div>
        <div style={{color:'var(--muted)'}}>Built with care • Privacy • Terms</div>
      </div>
    </footer>
  );
};

export default Footer;
