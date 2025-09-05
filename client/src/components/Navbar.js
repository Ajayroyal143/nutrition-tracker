import React from 'react';
import { ICONS } from '../data/icons';

const Navbar = ({ onLogout, setCurrentPage, currentPage }) => {
  const navLinks = [
    { name: 'Dashboard', icon: ICONS.Dashboard },
    { name: 'Food Log', icon: ICONS.Food },
    { name: 'Diet Plans', icon: ICONS.Plans },
    { name: 'Analysis', icon: ICONS.Analysis },
    { name: 'Profile', icon: ICONS.User }, // ✅ Profile in nav links
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow sticky-top">
      <div className="container-fluid">
        {/* Brand */}
        <span className="navbar-brand d-flex align-items-center fw-bold text-success">
          <ICONS.Logo size={28} className="me-2" />
          NutriTrack
        </span>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {navLinks.map((link) => (
              <li key={link.name} className="nav-item">
                <button
                  className={`btn nav-link d-flex align-items-center ${
                    currentPage === link.name ? 'active fw-bold text-success border-bottom border-success' : ''
                  }`}
                  onClick={() => setCurrentPage(link.name)}
                >
                  <link.icon size={18} className="me-2" />
                  {link.name}
                </button>
              </li>
            ))}
          </ul>

          {/* User + Logout */}
          <div className="d-flex align-items-center">
            {/* ✅ User icon now links to Profile */}
            <button
              className="btn btn-link text-decoration-none text-secondary d-flex align-items-center me-3"
              onClick={() => setCurrentPage('Profile')}
            >
              <ICONS.User size={22} className="me-1" />
              Profile
            </button>

            <button
              onClick={onLogout}
              className="btn btn-outline-danger btn-sm d-flex align-items-center"
            >
              <ICONS.Logout size={16} className="me-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
