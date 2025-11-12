// components/Header.tsx
import { RiMenu3Line } from "react-icons/ri";
import { SiGooglemessages } from "react-icons/si";
import { IoNotificationsCircleOutline } from "react-icons/io5";
import { useEffect, useState } from "react";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const userName = localStorage.getItem("userName") || "User"; // Change based on your auth

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const formattedDate = currentTime.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <header className="bg-purple-600 text-white p-1 md:p-0 shadow-lg sticky top-0 z-[997]">
      <div className="max-w-full mx-auto flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg bg-purple-700 hover:bg-purple-800 transition-colors md:hidden"
          aria-label="Open menu"
        >
          <RiMenu3Line size={28} />
        </button>

        {/* Welcome Message */}
        <div className="flex-1 text-left ml-4">
          <h2
            className="text-lg md:text-2xl font-bold"
            style={{ fontFamily: "'Ubuntu', sans-serif" }}
          >
            Welcome again, <span className="text-yellow-300">{userName}</span>
          </h2>
        </div>

        {/* Right Icons + Date/Time */}
        <div className="items-center gap-[-6px]">
          {/* Date & Time */}
          <div className="hidden md:block text-right mr-4">
            <p className="text-sm md:text-lg font-bold">{formattedDate}</p>
            <p className="text-xs md:text-sm">{formattedTime}</p>
          </div>

          
        </div>
      </div>
    </header>
  );
};