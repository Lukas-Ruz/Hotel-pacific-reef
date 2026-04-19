import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import RoomCard from '../components/RoomCard';
import { CalendarIcon, UserGroupIcon, WifiIcon, SunIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [searchDates, setSearchDates] = useState({ checkIn: '', checkOut: '' });

  useEffect(() => {

    // Cargar 3 habitaciones destacadas 2 turista, 1 premium
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/rooms/?limit=3');
        
        // Mezclar para mostrar variedad: 2 turista, 1 premium
        const tourist = response.data.filter(r => r.category === 'tourist').slice(0, 2);
        const premium = response.data.filter(r => r.category === 'premium').slice(0, 1);
        setFeaturedRooms([...tourist, ...premium]);
      } catch (error) {
        console.error('Error cargando destacadas:', error);
      }
    };
    fetchFeatured();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchDates.checkIn && searchDates.checkOut) {
      navigate(`/rooms?checkIn=${searchDates.checkIn}&checkOut=${searchDates.checkOut}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[500px] bg-ocean-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&auto=format&fit=crop" 
          alt="Hotel Pacific Reef"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-900 via-transparent to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">
            {t('home.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-ocean-100 text-center max-w-2xl">
            {t('home.subtitle')}
          </p>
          
          {/* Buscador rápido */}
          <form onSubmit={handleQuickSearch} className="bg-white rounded-xl p-4 shadow-2xl max-w-3xl w-full flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Check-in</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded text-gray-800"
                value={searchDates.checkIn}
                onChange={(e) => setSearchDates({...searchDates, checkIn: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Check-out</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded text-gray-800"
                value={searchDates.checkOut}
                onChange={(e) => setSearchDates({...searchDates, checkOut: e.target.value})}
                min={searchDates.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
            <button type="submit" className="btn-primary md:self-end md:mb-0">
              {t('home.cta')}
            </button>
          </form>
        </div>
      </div>

      {/* Características */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <WifiIcon className="w-12 h-12 text-ocean-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">WiFi Premium</h3>
            <p className="text-gray-600">Conexión de alta velocidad en todas las habitaciones</p>
          </div>
          <div className="p-6">
            <SunIcon className="w-12 h-12 text-ocean-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Vista al Océano</h3>
            <p className="text-gray-600">Habitaciones premium con vista panorámica al mar</p>
          </div>
          <div className="p-6">
            <UserGroupIcon className="w-12 h-12 text-ocean-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Atención 24/7</h3>
            <p className="text-gray-600">Recepción y servicio al cliente todo el día</p>
          </div>
        </div>
      </div>

      {/* Habitaciones Destacadas */}
      <div className="max-w-7xl mx-auto px-4 py-16 bg-white">
        <h2 className="text-3xl font-bold text-ocean-900 text-center mb-12">
          Habitaciones Destacadas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredRooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/rooms" className="btn-secondary text-lg inline-block">
            Ver todas las habitaciones →
          </Link>
        </div>
      </div>

      {/* Info adicional */}
      <div className="bg-ocean-50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-ocean-900 mb-4">
            ¿Listo para tu estadía perfecta?
          </h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            38 habitaciones disponibles, desde opciones turista económicas hasta suites premium con vista al mar. 
            Reserva ahora con solo el 30% de anticipo.
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <span>✓ Cancelación flexible</span>
            <span>✓ Mejor precio garantizado</span>
            <span>✓ Check-in digital</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;