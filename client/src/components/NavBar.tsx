import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Plus, Bell, User } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

 const navItems = [
  { path: "/dashboard", icon: Home },
  { path: "/calendar", icon: Calendar },
  { path: "/create", icon: Plus },
  { path: "/notifications", icon: Bell },
  { path: "/profile", icon: User }, // 🔥 ÚJ
];
  

  return (
    <div className='fixed bottom-7 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xl px-10 py-4 rounded-full flex gap-9 shadow-lg'>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center justify-center transition ${
              isActive ? 'text-green-400 scale-110' : 'text-gray-400'
            }`}
          >
            <Icon size={27} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
};

export default Navbar;
