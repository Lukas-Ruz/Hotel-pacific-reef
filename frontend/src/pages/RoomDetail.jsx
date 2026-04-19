import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [selectedDates, setSelectedDates] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const response = await api.get(`/rooms/${id}/`);
      setRoom(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReserve = () => {
    if (!user) {
      navigate('/login', { state: { from: `/rooms/${id}` } });
      return;
    }
    
    if (!selectedDates) {
      alert('Por favor selecciona fechas primero');
      return;
    }
    
    // Navegar a wizard de reserva con datos
    navigate('/booking/confirm', {
      state: {
        room,
        ...selectedDates
      }
    });
  };

  if (!room) return <div className="text-center py-12">Cargando...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div>
          <div className="aspect-video rounded-xl overflow-hidden mb-4">
            <img 
              src={room.images[currentImage]} 
              alt={room.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {room.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                  currentImage === idx ? 'border-ocean-600' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info y Reserva */}
        <div>
          <h1 className="text-3xl font-bold text-ocean-900 mb-2">{room.name}</h1>
          <p className="text-gray-600 mb-4">{room.description}</p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Características:</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {room.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            
            <h3 className="font-semibold mb-2 mt-4">Equipamiento:</h3>
            <div className="flex flex-wrap gap-2">
              {room.equipment.map((e, i) => (
                <span key={i} className="bg-white px-3 py-1 rounded-full text-sm border">
                  {e}
                </span>
              ))}
            </div>
          </div>

          <div className="text-2xl font-bold text-ocean-600 mb-6">
            ${room.price_daily} <span className="text-sm text-gray-500 font-normal">/ noche</span>
          </div>

          <AvailabilityCalendar 
            roomId={room.id} 
            priceDaily={room.price_daily}
            onSelectDates={setSelectedDates}
          />

          <button 
            onClick={handleReserve}
            className="w-full mt-6 btn-primary py-3 text-lg"
            disabled={!selectedDates}
          >
            {selectedDates ? 'Continuar con Reserva' : 'Selecciona fechas primero'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;