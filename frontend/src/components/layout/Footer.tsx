import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import schoolLogo from '@/assets/images/logo.jpg';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* School Info */}
          <div className="lg:col-span-2">
            <Link to="/home" className="flex items-center gap-3 mb-6 group">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 overflow-hidden p-1 border border-border">
                <img src={schoolLogo} alt="CVNHS Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-primary block">
                  CVNHS Research Library
                </span>
                <span className="text-xs text-muted-foreground">
                  Catubig Valley National High School
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mb-6">
              The CVNHS Electronic Research Library is an internal digital repository specifically
              designed to archive and manage senior high school research papers. This archive is
              intended for academic reference within the CVNHS community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/home', label: 'Home' },
                { href: '/papers', label: 'All Research Papers' },
                { href: '/strands', label: 'Browse by Strand' },
                { href: '/about', label: 'About the Library' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} Catubig Valley National High School. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Preserving academic heritage through digital archiving.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
