import Navbar from './NavBar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className='min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300'>
      <div className='p-4'>
        <Outlet />
      </div>
      <Navbar />
    </div>
  );
};

export default Layout;
