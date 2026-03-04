import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Sidebar />
      <main className="flex-grow-1 overflow-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
