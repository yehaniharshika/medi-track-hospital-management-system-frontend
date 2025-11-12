// components/Navigation.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FaFileMedical,
  FaGear,
  FaHouseMedicalCircleCheck,
  FaPersonCirclePlus,
  FaUserDoctor,
  FaUserNurse,
} from "react-icons/fa6";
import { RiCloseLine } from "react-icons/ri";
import { GiMedicines } from "react-icons/gi";
import { LuCalendarPlus2 } from "react-icons/lu";
import { AiOutlineAppstore } from "react-icons/ai";
import { FaMoneyCheckAlt, FaSignOutAlt } from "react-icons/fa";

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Navigation = ({ isOpen, onClose }: NavigationProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("refreshToken");
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[998] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer (Right Side) */}
      <aside
        className={`
          fixed top-0 right-0 h-full bg-purple-500 text-white z-[999] w-64
          transition-transform duration-300 ease-in-out shadow-2xl
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          md:hidden
        `}
      >
        <div className="flex flex-col h-full">
          <div className="py-4 px-4 flex justify-between items-center border-b border-purple-400">
            <h1 className="text-[16px] font-bold">MediTrack</h1>
            <button
              onClick={onClose}
              className="text-white p-2 hover:bg-purple-600 rounded-lg transition-colors"
            >
              <RiCloseLine size={26} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <ul className="space-y-1 px-3">
              {navItems.map((item) =>
                item.to === "/logout" ? (
                  <li key={item.to}>
                    <button
                      onClick={handleLogout}
                      className="w-full p-3 rounded-lg text-sm font-medium text-left
                                 text-white hover:bg-violet-400 hover:text-white transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="min-w-[24px] flex justify-center">
                          {item.icon}
                        </span>
                        <span className="whitespace-nowrap">{item.label}</span>
                      </div>
                    </button>
                  </li>
                ) : (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end
                      onClick={onClose}
                      className="block p-3 rounded-lg text-sm font-medium
                                 text-white hover:bg-violet-400 hover:text-white transition-all duration-300
                                 [&.active]:bg-violet-400 [&.active]:text-blue-950 [&.active]:shadow-md"
                      style={{ textDecoration: "none" }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="min-w-[24px] flex justify-center">
                          {item.icon}
                        </span>
                        <span className="whitespace-nowrap">{item.label}</span>
                      </div>
                    </NavLink>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex h-full bg-purple-500 text-white transition-all duration-300 flex-col
          ${collapsed ? "w-20" : "w-64"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header with Collapse Button */}
          <div className="py-4 px-4 flex justify-end items-center border-b border-purple-400">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-white p-2 hover:bg-purple-600 rounded-lg transition-colors"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <RiCloseLine
                size={22}
                className={`transition-transform duration-300 ${
                  collapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <ul className="space-y-1 px-3">
              {navItems.map((item) =>
                item.to === "/logout" ? (
                  <li key={item.to}>
                    <button
                      onClick={handleLogout}
                      className={`
                        group relative w-full rounded-lg text-sm font-medium text-left
                        text-white hover:text-white transition-all duration-300
                        ${collapsed ? "p-3" : "p-3"}
                      `}
                    >
                      <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                        <span className="min-w-[24px] flex justify-center">
                          {item.icon}
                        </span>
                        <span
                          className={`transition-all overflow-hidden whitespace-nowrap
                            ${collapsed ? "opacity-0 w-0" : "opacity-100"}`}
                        >
                          {item.label}
                        </span>
                      </div>

                      {/* Tooltip on Hover (Collapsed Mode) */}
                      {collapsed && (
                        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                          {item.label}
                        </span>
                      )}
                    </button>
                  </li>
                ) : (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end
                      className={({ isActive }) => `
                        group relative block rounded-lg text-sm font-medium
                        text-white hover:bg-violet-400 hover:text-white transition-all duration-300
                        ${collapsed ? "p-3" : "p-3"}
                        ${
                          isActive
                            ? "bg-violet-400 text-blue-950 shadow-md"
                            : ""
                        }
                      `}
                      style={{ textDecoration: "none" }}
                    >
                      <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                        <span className="min-w-[24px] flex justify-center">
                          {item.icon}
                        </span>
                        <span
                          className={`transition-all overflow-hidden whitespace-nowrap
                            ${collapsed ? "opacity-0 w-0" : "opacity-100"}`}
                        >
                          {item.label}
                        </span>
                      </div>

                      {/* Tooltip on Hover (Collapsed Mode) */}
                      {collapsed && (
                        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                          {item.label}
                        </span>
                      )}
                    </NavLink>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

// Navigation Items
const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <AiOutlineAppstore size={22} />,
  },
  {
    to: "/department",
    label: "Department",
    icon: <FaHouseMedicalCircleCheck size={22} />,
  },
  { to: "/doctor", label: "Doctor", icon: <FaUserDoctor size={22} /> },
  { to: "/nurse", label: "Nurse", icon: <FaUserNurse size={22} /> },
  { to: "/patient", label: "Patient", icon: <FaPersonCirclePlus size={22} /> },
  {
    to: "/appointment",
    label: "Appointment",
    icon: <LuCalendarPlus2 size={22} />,
  },
  { to: "/medicine", label: "Medicine", icon: <GiMedicines size={22} /> },
  { to: "/report", label: "Medical Report", icon: <FaFileMedical size={22} /> },
  { to: "/payment", label: "Payment", icon: <FaMoneyCheckAlt size={22} /> },
  { to: "/setting", label: "Settings", icon: <FaGear size={22} /> },
  { to: "/logout", label: "Log Out", icon: <FaSignOutAlt size={22} /> },
];