import React, { useState } from "react";
import pic from "./sub.png";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../AuthContext";
import { getAuth, signOut } from "firebase/auth";
import { config } from "../../../firebase/Firebase";
import {
  getUserRole,
  getDefaultRoute,
} from "../../../utils/AuthorizationManager";

import { Disclosure } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Home", href: "/", current: true },
  { name: "About", href: "/aboutus", current: false },
  { name: "FAQs", href: "/questions", current: false },
];

const Login = [
  { name: "Login", href: "/login", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const { isLoggedIn, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // State to keep track of the selected navigation item
  const [selectedItem, setSelectedItem] = useState(
    navigation.find((item) => item.current)
  );

  const handleNavigationClick = (item) => {
    setSelectedItem(item); // Update the selected item when a navigation item is clicked
    navigate(item.href);
  };

  const handleHomeClick = () => {
    if (isLoggedIn) {
      // For authenticated users, navigate to their dashboard
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          const userRole = getUserRole(user.email);
          if (userRole) {
            const defaultRoute = getDefaultRoute(userRole);
            navigate(defaultRoute);
          } else {
            navigate("/login");
          }
        } catch (error) {
          console.error(
            "Error determining user role:",
            error
          );
          navigate("/login");
        }
      }
    } else {
      // For unauthenticated users, navigate to landing page
      navigate("/");
    }
  };

  // const auth = getAuth()
  const handleLogout = () => {
    signOut(config.auth)
      .then(() => {
        // AuthContext will automatically handle logout state through Firebase
        navigate("/login");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Show loading state while determining authentication
  if (loading) {
    return (
      <header>
        <Disclosure as="nav" style={{ height: "100px" }}>
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                  <div className="flex flex-1 items-center sm:items-stretch sm:justify-start">
                    <div className="flex flex-shrink-0 items-center">
                      <img
                        className="h-8 w-auto"
                        src={pic}
                        alt="Your Company"
                      />
                    </div>
                  </div>
                  <div className="hidden sm:ml-6 sm:block mt-10 absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto mr-20 sm:pr-0">
                    <div className="flex space-x-6">
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Disclosure>
      </header>
    );
  }

  return (
    <header>
      <Disclosure as="nav" style={{ height: "100px" }}>
        {({ open }) => (
          <>
            <div className="mx-auto shadow-2xl drop-shadow-2xl h-24">
              <div className="relative flex h-16 items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">
                      Open main menu
                    </span>
                    {open ? (
                      <XMarkIcon
                        className="block h-6 w-6"
                        aria-hidden="true"
                      />
                    ) : (
                      <Bars3Icon
                        className="block h-6 w-6"
                        aria-hidden="true"
                      />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-1 items-center sm:items-stretch ml-10 mt-10">
                  <div className="flex flex-shrink-0 items-center">
                    <img
                      className="h-12 w-auto"
                      src={pic}
                      alt="Your Company"
                    />
                    <span className="ml-3 text-3xl enriqueta ">
                      Health Care System
                    </span>
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:block mt-10 absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto mr-20 sm:pr-0">
                  <div className="flex space-x-6">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        onClick={() =>
                          item.name === "Home"
                            ? handleHomeClick()
                            : handleNavigationClick(item)
                        } // Handle navigation item click
                        className={classNames(
                          selectedItem === item
                            ? "exo bg-pink-100"
                            : "exo hover:bg-pink-50 hover:text-black",
                          "rounded-md px-3 py-2 text-xl font-bold"
                        )}
                        aria-current={
                          item === selectedItem
                            ? "page"
                            : undefined
                        }
                      >
                        {item.name}
                      </a>
                    ))}
                    {isLoggedIn ? (
                      <a
                        onClick={() => handleLogout()}
                        className={classNames(
                          selectedItem === "Logout"
                            ? "exo bg-pink-100"
                            : "exo hover:bg-pink-50 hover:text-black",
                          "rounded-md px-3 py-2 text-xl font-bold"
                        )}
                      >
                        Logout
                      </a>
                    ) : (
                      <a
                        onClick={() =>
                          handleNavigationClick({
                            name: "Login",
                            href: "/login",
                            current: false,
                          })
                        }
                        className={classNames(
                          selectedItem === Login
                            ? "exo bg-pink-100"
                            : "exo hover:bg-pink-50 hover:text-black",
                          "rounded-md px-3 py-2 text-xl font-bold"
                        )}
                      >
                        Login
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Disclosure>
    </header>
  );
}
