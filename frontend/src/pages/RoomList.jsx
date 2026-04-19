import { Link } from 'react-router-dom';
import { UserGroupIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const RoomCard = ({ room }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48">
        <img 
          src={room.images[0]} 
          alt={room.name}
          className="w-full h-full object-cover"
        />
        <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold ${
          room.category === 'premium' ? 'bg-coral-500 text-white' : 'bg-ocean-500 text-white'
        }`}>
          {room.category === 'premium' ? 'Premium' : 'Turista'}
        </span>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{room.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{room.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <UserGroupIcon className="w-4 h-4" />
            {room.capacity} pers.
          </span>
          <span className="flex items-center gap-1">
            <BanknotesIcon className="w-4 h-4" />
            ${room.price_daily}/noche
          </span>
        </div>
        
        <Link 
          to={`/rooms/${room.id}`}
          className="block text-center btn-primary"
        >
          Ver Detalle
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;