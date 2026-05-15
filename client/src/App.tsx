import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Create from './pages/Create';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Notifications from './pages/Notofication';
const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer position='top-center' />

      <Routes>
        {/* PUBLIC */}
        <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        {/* PROTECTED + LAYOUT */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/calendar' element={<Calendar />} /> {/* ✅ FIX */}
          <Route path='/settings' element={<Settings />} /> {/* ✅ FIX */}
          <Route path='/create' element={<Create />} />
          <Route path='/notifications' element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
