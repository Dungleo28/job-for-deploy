import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { refresh_token } from './services/auth';
import { access_token } from './constants/token';

import './assets/reset.scss';
import './assets/global.scss';

import routes from './routes';
import Footer  from './components/Footer/Footer';
import Header from './components/Header/Header';



function App() {

  const location = useLocation();

  const showFooter = /^\/(vacancies|applicants|employers)?$/.test(location.pathname);



  const isAuthorized = access_token;
  useEffect(() => {
    if (isAuthorized) {
      const refreshToken = async () => {
        await refresh_token();
      };
      refreshToken();
      const interval = setInterval(refreshToken, 60 * 60 * 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [isAuthorized]);

  return (
    <div className="container">
      <Header />
      <Routes>
        {routes.map((route) => (
          <Route 
            key={route.path} 
            path={route.path} 
            element={<route.page />}
          />
        ))}
      </Routes>

      {/* Chỉ hiển thị footer nếu ở một trong ba trang này */}
      {showFooter && <Footer />}

    </div>
  );
}

export default App;
