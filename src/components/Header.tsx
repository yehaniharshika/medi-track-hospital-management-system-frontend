// components/Header.tsx
import { RiMenu3Line } from "react-icons/ri";
import { useEffect, useState } from "react";
import profileImage from "../images/profile.png"; // Import the image

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

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
          className="p-3 rounded-lg hover:p-2 transition-colors md:hidden"
          aria-label="Open menu"
        >
          <RiMenu3Line size={28} />
        </button>

        {/* Date & Time - LEFT SIDE */}
        <div className="hidden md:block text-left ml-4" style={{padding: '0'}}>
          <p className="text-sm md:text-lg font-bold">{formattedDate}</p>
          <p className="text-xs md:text-sm font-semibold">{formattedTime}</p>
        </div>

        {/* User Profile Image - RIGHT SIDE */}
        <div className="flex items-center mr-4">
          <img
            src={profileImage}
            alt="User Profile"
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-purple-900 shadow-md"
          />
        </div>
      </div>
    </header>
  );
};