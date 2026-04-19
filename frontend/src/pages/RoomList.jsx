import { useState, useEffect } from 'react';
import api from '../api/axios';
import RoomCard from '../components/RoomCard';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, [category]);

  const fetchRooms = async () => {
    try {
      const params = category ? { category } : {};
      const response = await api.get('/rooms/', { params });
      setRooms(response.data);
    } catch (error) {
      console.error('Error cargando habitaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-ocean-900 mb-6">Nuestras Habitaciones</h1>
      
      {/* Filtros */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setCategory('')}
          className={`px-4 py-2 rounded-lg ${!category ? 'bg-ocean-600 text-white' : 'bg-gray-200'}`}
        >
          Todas
        </button>
        <button 
          onClick={() => setCategory('tourist')}
          className={`px-4 py-2 rounded-lg ${category === 'tourist' ? 'bg-ocean-600 text-white' : 'bg-gray-200'}`}
        >
          Turista
        </button>
        <button 
          onClick={() => setCategory('premium')}
          className={`px-4 py-2 rounded-lg ${category === 'premium' ? 'bg-coral-500 text-white' : 'bg-gray-200'}`}
        >
          Premium
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomList;