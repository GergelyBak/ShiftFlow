import Navbar from './NavBar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className='min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300'>
      {/* Tablet-width column on larger screens instead of full-width stretch */}
      <div className='mx-auto w-full max-w-3xl p-4 md:px-6 md:pt-6'>
        <Outlet />
      </div>
      <Navbar />
    </div>
  );
};

export default Layout;
