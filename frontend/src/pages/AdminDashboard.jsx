import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Obtener todas las reservas como admin
      const res = await api.get('/reservations/');
      const bookings = res.data;
      setRecentBookings(bookings.slice(0, 5));
      
      // Calcular estadísticas
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookings.filter(b => b.check_in === today);
      const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.advance_paid), 0);
      
      setStats({
        totalBookings: bookings.length,
        todayCheckins: todayBookings.length,
        totalRevenue: totalRevenue.toFixed(2),
        occupancyRate: Math.round((bookings.length / 38) * 100) // Simplificado
      });
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    }

  const handleCancel = async (id) => {
  if (!confirm('¿Cancelar esta reserva?')) return;
  try {
    await api.patch(`/reservations/${id}/cancel/`);
    fetchDashboardData(); // Recargar
    alert('Reserva cancelada');
  } catch (error) {
    alert('Error al cancelar');
  }
};

  };

  if (user?.role !== 'admin') {
    return <div className="text-center py-12">Acceso denegado</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ocean-900 mb-6">Panel de Administración</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-600">Total Reservas</p>
          <p className="text-3xl font-bold text-ocean-600">{stats?.totalBookings || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-600">Check-ins Hoy</p>
          <p className="text-3xl font-bold text-green-600">{stats?.todayCheckins || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-600">Ingresos (Anticipos)</p>
          <p className="text-3xl font-bold text-coral-500">${stats?.totalRevenue || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-600">Ocupación Estimada</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.occupancyRate || 0}%</p>
        </div>
      </div>

      {/* Reservas Recientes */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Reservas Recientes</h2>
          <Link to="/admin/reservations" className="text-ocean-600 hover:underline text-sm">
            Ver todas →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-3">Código</th>
                <th className="px-6 py-3">Huésped</th>
                <th className="px-6 py-3">Habitación</th>
                <th className="px-6 py-3">Fechas</th>
                <th className="px-6 py-3">Monto</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs">{booking.id.slice(0,8)}</td>
                  <td className="px-6 py-4">{booking.user_name}</td>
                  <td className="px-6 py-4">{booking.room.name}</td>
                  <td className="px-6 py-4">
                    {booking.check_in} → {booking.check_out}
                  </td>
                  <td className="px-6 py-4">${booking.total_amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      disabled={booking.status !== 'confirmed'}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 text-sm"
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;