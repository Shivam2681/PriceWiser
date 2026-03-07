"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { registerUser } from "@/lib/actions/auth";
import toast from "react-hot-toast";

export default function AuthModal({ isOpen, setIsOpen, onSuccess, isAdminMode = false }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(isAdminMode);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isAdmin) {
        // Admin login
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          isAdmin: "true",
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Admin logged in successfully!");
          setIsOpen(false);
          onSuccess?.();
        }
      } else if (isLogin) {
        // Regular user login
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Logged in successfully!");
          setIsOpen(false);
          onSuccess?.();
        }
      } else {
        // Register
        await registerUser(formData);
        toast.success("Account created! Please log in.");
        setIsLogin(true);
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <div className="p-3 border border-gray-200 rounded-10">
                    <Image
                      src="/assets/icons/logo.svg"
                      alt="logo"
                      width={28}
                      height={28}
                    />
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <Image
                      src="/assets/icons/x-close.svg"
                      alt="close"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>

                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  {isAdmin ? "Admin Login" : isLogin ? "Welcome back" : "Create account"}
                </Dialog.Title>

                {/* Admin/User Switch */}
                <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                  <button
                    type="button"
                    onClick={() => setIsAdmin(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                      !isAdmin ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdmin(true);
                      setIsLogin(true); // Force login mode when switching to admin
                    }}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                      isAdmin ? "bg-secondary text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Admin
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  {isAdmin 
                    ? "Admin access only" 
                    : isLogin 
                      ? "Sign in to track products and get price alerts" 
                      : "Join PriceWise to start tracking products"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required={!isLogin}
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-secondary hover:bg-opacity-90 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {isAdmin ? "Signing in..." : isLogin ? "Signing in..." : "Creating account..."}
                      </span>
                    ) : isAdmin ? (
                      "Sign In"
                    ) : isLogin ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                {!isAdmin && (
                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                      <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-1 text-primary font-semibold hover:underline"
                      >
                        {isLogin ? "Sign up" : "Sign in"}
                      </button>
                    </p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
