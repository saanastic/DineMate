import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { ROUTES } from '../../constants/routes';

const ProtectedRoute = ({ children }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  if (!accessToken && !refreshToken) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

export default ProtectedRoute;
