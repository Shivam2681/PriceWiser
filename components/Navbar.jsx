"use client";

import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import AuthModal from './AuthModal'

const Navbar = () => {
  const { data: session, status } = useSession()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showDropdown])

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' })
      toast.success("Logged out successfully")
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  return (
    <>
      <header className="w-full">
        <nav className="nav">
          <Link href="/" className="flex items-center gap-1">
            <Image 
              src="/assets/icons/logo.svg"
              width={27}
              height={27}
              alt="logo"
            />
            <p className="nav-logo">
              Price<span className='text-primary'>Wiser</span>
            </p>
          </Link>

          <div className="flex items-center gap-5">
            <Link href="/" className="hidden sm:block p-2 hover:bg-gray-100 rounded-lg transition">
              <Image 
                src="/assets/icons/search.svg"
                alt="search"
                width={24}
                height={24}
                className="object-contain opacity-70"
              />
            </Link>

            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-1 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-primary text-white flex items-center justify-center font-semibold text-sm shadow-md">
                    {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-sm text-gray-900 truncate">{session.user.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{session.user.email}</p>
                      {session.user.isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-2 bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-full font-medium">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="py-1">
                      {session.user.isAdmin ? (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          Admin Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/favorites"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Favorites
                          </Link>
                        </>
                      )}
                    </div>
                    <div className="border-t border-gray-100 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </nav>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        setIsOpen={setShowAuthModal} 
      />
    </>
  )
}

export default Navbar