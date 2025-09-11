import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '../store/auth';
import { PropsWithChildren } from 'react';

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const token = getAccessToken();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
