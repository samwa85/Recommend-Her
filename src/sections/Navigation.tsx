import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/mission', label: 'The Mission' },
    { path: '/for-talent', label: 'For Talent' },
    { path: '/for-sponsors', label: 'For Sponsors' },
    { path: '/talent-pool', label: 'Talent Pool' },
    { path: '/resources', label: 'Resources' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-sm py-4`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo - Larger */}
          <Link
            to="/"
            className="flex items-center transition-transform duration-300 hover:scale-105"
          >
            <img
              src="/images/logo.png"
              alt="Recommend Her"
              className="h-16 sm:h-20 w-auto object-contain"
              style={{ maxWidth: '280px' }}
              loading="eager"
              fetchPriority="high"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-sans text-base font-semibold transition-colors duration-300 group ${
                  isActive(link.path)
                    ? 'text-[var(--primary)]'
                    : 'text-gray-800 hover:text-[var(--primary)]'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-1/2 h-0.5 bg-[var(--primary)] transition-all duration-300 -translate-x-1/2 ${
                    isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link
              to="/for-sponsors"
              className="px-6 py-3 rounded-lg font-sans text-base font-bold transition-all duration-300 hover:-translate-y-0.5"
              style={{ 
                backgroundColor: 'var(--primary)', 
                color: 'var(--primary-foreground)',
                boxShadow: 'var(--shadow)'
              }}
            >
              Join the Movement
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-[500px] mt-4' : 'max-h-0'
          }`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-3 font-sans text-lg font-semibold border-b last:border-0 ${
                  isActive(link.path)
                    ? 'text-[var(--primary)]'
                    : 'text-gray-800 hover:text-[var(--primary)]'
                }`}
                style={{ borderColor: '#f3f4f6' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/for-sponsors"
              className="block mt-4 px-6 py-3 rounded-lg font-sans text-lg font-bold text-center transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--primary)', 
                color: 'var(--primary-foreground)'
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Join the Movement
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
