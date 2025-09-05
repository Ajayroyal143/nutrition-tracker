import React from 'react';

const Footer = () => {
  return (
    <footer className="text-center py-3 mt-4 border-top text-muted">
      <p className="mb-0">
        &copy; {new Date().getFullYear()} NutriTrack. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
