import { BrowserRouter } from 'react-router-dom';
import QueryProvider from './providers/QueryProvider.jsx';
import { AuthProvider } from './providers/AuthProvider.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}
