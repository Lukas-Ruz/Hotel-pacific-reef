import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState('');
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateQR = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/reservations/validate-qr/', {
        qr_code: qrCode
      });
      setValidation(response.data);
    } catch (error) {
      setValidation({ valid: false, error: 'Código inválido o reserva no encontrada' });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'employee' && user?.role !== 'admin') {
    return <div className="text-center py-12">Acceso restringido a personal del hotel</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ocean-900 mb-6">Validación de Check-in</h1>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <form onSubmit={validateQR} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Código QR o Número de Reserva</label>
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Ej: RES-A1B2C3D4E5F6"
              className="w-full p-3 border rounded-lg font-mono"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !qrCode}
            className="w-full btn-primary"
          >
            {loading ? 'Validando...' : 'Validar Reserva'}
          </button>
        </form>
      </div>

      {validation && (
        <div className={`rounded-xl p-6 ${
          validation.valid ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
        }`}>
          {validation.valid ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-green-800 mb-4">¡Reserva Válida!</h2>
              <div className="text-left space-y-2 bg-white p-4 rounded-lg">
                <p><strong>Huésped:</strong> {validation.guest}</p>
                <p><strong>Habitación:</strong> {validation.room}</p>
                <p><strong>Check-in:</strong> {validation.check_in}</p>
                <p><strong>Check-out:</strong> {validation.check_out}</p>
              </div>
              <button className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
                Confirmar Check-in
              </button>
            </div>
          ) : (
            <div className="text-center text-red-700">
              <p className="font-semibold">{validation.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;