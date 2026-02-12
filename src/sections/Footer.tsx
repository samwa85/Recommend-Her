import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Instagram } from 'lucide-react';

const footerLinks = {
  quickLinks: [
    { label: 'Home', path: '/' },
    { label: 'The Mission', path: '/mission' },
    { label: 'For Talent', path: '/for-talent' },
    { label: 'For Sponsors', path: '/for-sponsors' },
    { label: 'Talent Pool', path: '/talent-pool' },
    { label: 'Resources', path: '/resources' },
    { label: 'Contact', path: '/contact' },
  ],
  resources: [
    { label: 'Success Stories', path: '/resources' },
    { label: 'Blog', path: '/resources' },
    { label: 'Privacy Policy', path: '/' },
    { label: 'Terms of Service', path: '/' },
  ],
};

const socialLinks = [
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/recommend-her-tanzania-0991893aa/' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
];

const Footer = () => {
  return (
    <footer 
      className="pt-16 pb-8"
      style={{ backgroundColor: 'oklch(0.30 0.12 340)' }}
    >
      {/* Top border */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="h-px mb-12"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6 group">
              <div className="relative transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/images/logo.png"
                  alt="Recommend Her"
                  className="h-16 sm:h-20 w-auto object-contain"
                  style={{
                    maxWidth: '280px',
                    filter: 'brightness(0) invert(1)'
                  }}
                  loading="lazy"
                />
              </div>
            </Link>
            <p className="font-serif text-lg sm:text-xl text-white/90 leading-relaxed mb-4 font-semibold">
              Empowering women through intentional sponsorship
              networks.
            </p>
            <p className="font-sans text-base font-bold" style={{ color: 'var(--accent)' }}>
              #RecommendHerMovement
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white uppercase tracking-wider mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="font-sans text-base text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white uppercase tracking-wider mb-5">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="font-sans text-base text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white uppercase tracking-wider mb-5">
              Connect With Us
            </h4>
            <p className="font-sans text-base text-white/70 mb-4">
              Follow our journey and join the conversation.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full flex items-center justify-center
                           text-white/70 transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-sans text-sm text-white/50">
              © 2026 Recommend Her. All rights reserved.
            </p>
            <p className="font-sans text-xs text-white/40">
              Made with passion for gender equity.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
