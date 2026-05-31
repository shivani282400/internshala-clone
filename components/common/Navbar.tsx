'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-white border-b border-[#E2E5E8] sticky top-0 z-30 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/internships" className="flex items-center gap-1 flex-shrink-0">
          <svg width="26" height="20" viewBox="0 0 28 22" fill="none" className="mr-0.5 -mt-1" aria-hidden="true">
            <path d="M26 2L14 13M26 2L18 20L14 13L2 11L26 2Z" stroke="#008BCA" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M14 13L16.5 19" stroke="#008BCA" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span className="font-bold text-xl tracking-tight">
            <span className="text-[#008BCA]">INTERN</span>
            <span className="text-[#4d4d4d]">SHALA</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center">
          <Link href="/internships" className="relative flex items-center px-4 h-14 text-sm font-medium text-[#008BCA]">
            Internships
            <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#008BCA]" />
          </Link>
          <Link href="#" className="flex items-center gap-1.5 px-4 h-14 text-sm font-medium text-[#4d4d4d] hover:text-[#008BCA]">
            Courses
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#FF7F00] text-white rounded">OFFER</span>
          </Link>
          <Link href="#" className="px-4 h-14 flex items-center text-sm font-medium text-[#4d4d4d] hover:text-[#008BCA]">Jobs</Link>
          <div className="h-5 w-px bg-[#E2E5E8] mx-2" />
          <Link href="#" className="flex items-center gap-1 text-sm font-medium text-[#1A1A2E] hover:text-[#008BCA] px-3">
            Login / Register
            <svg className="w-3.5 h-3.5 text-[#9199A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
        </div>

        <button className="md:hidden p-2 text-[#9199A3]" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-[#E2E5E8] bg-white animate-fade-in">
          {['Internships','Courses','Jobs','Login / Register'].map(l => (
            <Link key={l} href="#" className="block px-4 py-2.5 text-sm text-[#4d4d4d] hover:text-[#008BCA] hover:bg-gray-50">{l}</Link>
          ))}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
