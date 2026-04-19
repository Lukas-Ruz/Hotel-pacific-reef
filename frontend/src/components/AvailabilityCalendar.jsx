import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, addDays } from 'date-fns';
import api from '../api/axios';

const AvailabilityCalendar = ({ roomId, priceDaily, onSelectDates }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDateChange = async (value) => {
    setDateRange(value);
    
    if (value[0] && value[1]) {
      setLoading(true);
      try {
        const checkIn = format(value[0], 'dd-mm-yyyy');
        const checkOut = format(value[1], 'dd-mm-yyyy');
        
        // Consultar disponibilidad específica para esta habitación
        const response = await api.get('/rooms/availability/', {
          params: {
            check_in: checkIn,
            check_out: checkOut,
            room_id: roomId
          }
        });
        
        setAvailability(response.data);
        onSelectDates({
          checkIn,
          checkOut,
          days: response.data.nights,
          total: response.data.nights * priceDaily
        });
      } catch (error) {
        alert('Error verificando disponibilidad');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold mb-4">Selecciona tus fechas</h3>
      
      <Calendar
        onChange={handleDateChange}
        value={dateRange}
        selectRange={true}
        minDate={new Date()}
        tileDisabled={({ date }) => date < new Date()}
      />
      
      {loading && <p className="mt-4 text-ocean-600">Verificando disponibilidad...</p>}
      
      {availability && (
        <div className="mt-4 p-4 bg-ocean-50 rounded-lg">
          <p className="font-semibold text-ocean-900">
            {availability.nights} noches seleccionadas
          </p>
          <p className="text-2xl font-bold text-ocean-600">
            Total: ${availability.nights * priceDaily}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Anticipo requerido (30%): ${(availability.nights * priceDaily * 0.3).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;