import { useContext, useEffect, Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

// project imports
import Header from '../Header';
import Footer from '../Footer';
import Navigation from './Navigation';
import useWindowSize from 'hooks/useWindowSize';
import { ConfigContext } from 'contexts/ConfigContext';
import * as actionType from 'store/actions';
import Loader from 'components/Loader/Loader';

export default function AdminLayout() {
  const windowSize = useWindowSize();
  const configContext = useContext(ConfigContext);
  const { collapseLayout } = configContext.state;
  const { dispatch } = configContext;

  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('authToken');
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    if (windowSize.width > 992 && windowSize.width <= 1024) {
      dispatch({ type: actionType.COLLAPSE_MENU });
    }
  }, [dispatch, windowSize]);

  useEffect(() => {
    const body = document.body;
    if (windowSize.width > 992 && collapseLayout) {
      body.classList.add('minimenu');
    } else {
      body.classList.remove('minimenu');
    }
  }, [windowSize, collapseLayout]);

  return (
    <>
      <Header />
      <Navigation />
      
      <div className="pc-container">
        <div className="pcoded-content mt-3">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>

      <Footer />
    </>
  );
}