import { useLocation, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  if (!state?.reservation) {
    navigate('/');
    return null;
  }

  const { reservation, qr_image } = state.reservation;
  
  // Simular envío de email
  const simulateEmail = () => {
    setShowEmailModal(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-ocean-900">¡Reserva Confirmada!</h1>
        <p className="text-gray-600 mt-2">
          Tu código de reserva: <span className="font-mono font-bold">{reservation.qr_code}</span>
        </p>
      </div>

      {/* Ticket con QR */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-ocean-100">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div className="text-left">
            <h2 className="font-bold text-ocean-900">Hotel Pacific Reef</h2>
            <p className="text-sm text-gray-600">Ticket de Reserva</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Fecha emisión</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left mb-6 text-sm">
          <div>
            <p className="text-gray-600">Habitación</p>
            <p className="font-semibold">{reservation.room.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Huésped</p>
            <p className="font-semibold">{reservation.user_name}</p>
          </div>
          <div>
            <p className="text-gray-600">Check-in</p>
            <p className="font-semibold">{reservation.check_in}</p>
          </div>
          <div>
            <p className="text-gray-600">Check-out</p>
            <p className="font-semibold">{reservation.check_out}</p>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <QRCodeSVG 
            value={reservation.qr_code} 
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        
        <p className="text-xs text-gray-500">
          Presenta este código QR en recepción para tu check-in
        </p>
      </div>

      <div className="space-y-3">
        <button 
          onClick={simulateEmail}
          className="w-full btn-secondary"
        >
           Simular envío de Email (Ver contenido)
        </button>
        
        <button 
          onClick={() => window.print()}
          className="w-full btn-primary"
        >
           Imprimir / Guardar PDF
        </button>
        
        <Link to="/" className="block text-ocean-600 hover:underline mt-4">
          Volver al inicio
        </Link>
      </div>

      {/* Modal Simulación Email */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="font-bold text-lg mb-4">Simulación de Email Enviado</h3>
            <div className="bg-gray-100 p-4 rounded text-sm font-mono text-left space-y-2">
              <p><strong>Para:</strong> {reservation.user_name} &lt;usuario@email.com&gt;</p>
              <p><strong>Asunto:</strong> Confirmación de Reserva - Hotel Pacific Reef</p>
              <hr />
              <p>Estimado {reservation.user_name},</p>
              <p>Su reserva ha sido confirmada:</p>
              <ul className="list-disc pl-5">
                <li>Habitación: {reservation.room.name}</li>
                <li>Fechas: {reservation.check_in} al {reservation.check_out}</li>
                <li>Total: ${reservation.total_amount}</li>
                <li>Anticipo pagado: ${reservation.advance_paid}</li>
              </ul>
              <p className="mt-4">Código QR adjunto para check-in.</p>
            </div>
            <button 
              onClick={() => setShowEmailModal(false)}
              className="mt-4 w-full btn-primary"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSuccess;