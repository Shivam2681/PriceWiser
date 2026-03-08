"use client";

import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import AuthModal from './AuthModal'

const Navbar = () => {
  const { data: session, status } = useSession()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

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
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-1 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-semibold">
                    {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-sm truncate">{session.user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                      {session.user.isAdmin && (
                        <span className="inline-block mt-1 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    {session.user.isAdmin ? (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        Admin Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowDropdown(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/favorites"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowDropdown(false)}
                        >
                          Favorites
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
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