// AdminPanel.jsx (Main page for admin)
import { Link } from 'react-router-dom';

export default function AdminPanel() {
  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      <div className="flex justify-center">
        <Link to="/volume" className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
          Manage Volumes
        </Link>
        
      </div>
    </div>
  );
}
