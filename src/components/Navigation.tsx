// components/Navigation.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FaFileMedical, FaGear, FaHouseMedicalCircleCheck,
  FaPersonCirclePlus, FaUserDoctor, FaUserNurse,
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
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[998] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer (Right) */}
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
            <button onClick={onClose} className="text-white">
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
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-left
                                 text-white hover:bg-violet-400 hover:text-white transition-all duration-300"
                    >
                      <span className="min-w-[24px] flex justify-center">{item.icon}</span>
                      <span className="whitespace-nowrap">{item.label}</span>
                    </button>
                  </li>
                ) : (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-left
                                 text-white hover:bg-violet-400 hover:text-white transition-all duration-300
                                 [&.active]:bg-violet-400 [&.active]:text-blue-950 [&.active]:shadow-md"
                      style={{ textDecoration: "none", color: "white" }} // ← Force white + no underline
                    >
                      <span className="min-w-[24px] flex justify-center">{item.icon}</span>
                      <span className="whitespace-nowrap">{item.label}</span>
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
          hidden md:block h-full bg-purple-500 text-white transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="py-4 px-4 flex justify-between items-center border-b border-purple-400">
            
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-white p-2 hover:bg-purple-600 rounded"
            >
              <RiCloseLine size={22} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <ul className="space-y-1 px-3">
              {navItems.map((item) =>
                item.to === "/logout" ? (
                  <li key={item.to}>
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-left
                                 text-white hover:bg-violet-400 hover:text-white transition-all duration-300
                                 ${collapsed ? "justify-center" : ""}`}
                    >
                      <span className="min-w-[24px] flex justify-center">{item.icon}</span>
                      <span
                        className={`transition-all ${
                          collapsed ? "opacity-0 w-0" : "opacity-100"
                        } overflow-hidden whitespace-nowrap`}
                      >
                        {item.label}
                      </span>
                    </button>
                  </li>
                ) : (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end
                      className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-left
                                 text-white hover:bg-violet-400 hover:text-white transition-all duration-300
                                 [&.active]:bg-violet-400 [&.active]:text-blue-950 [&.active]:shadow-md
                                 ${collapsed ? 'justify-center' : ''}"
                      style={{ textDecoration: "none", color: "white" }} // ← Critical
                    >
                      <span className="min-w-[24px] flex justify-center">{item.icon}</span>
                      <span
                        className={`transition-all ${
                          collapsed ? "opacity-0 w-0" : "opacity-100"
                        } overflow-hidden whitespace-nowrap`}
                      >
                        {item.label}
                      </span>
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

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: <AiOutlineAppstore size={22} /> },
  { to: "/department", label: "Department", icon: <FaHouseMedicalCircleCheck size={22} /> },
  { to: "/doctor", label: "Doctor", icon: <FaUserDoctor size={22} /> },
  { to: "/nurse", label: "Nurse", icon: <FaUserNurse size={22} /> },
  { to: "/patient", label: "Patient", icon: <FaPersonCirclePlus size={22} /> },
  { to: "/appointment", label: "Appointment", icon: <LuCalendarPlus2 size={22} /> },
  { to: "/medicine", label: "Medicine", icon: <GiMedicines size={22} /> },
  { to: "/report", label: "Medical Report", icon: <FaFileMedical size={22} /> },
  { to: "/payment", label: "Payment", icon: <FaMoneyCheckAlt size={22} /> },
  { to: "/setting", label: "Settings", icon: <FaGear size={22} /> },
  { to: "/logout", label: "Log Out", icon: <FaSignOutAlt size={22} /> },
];