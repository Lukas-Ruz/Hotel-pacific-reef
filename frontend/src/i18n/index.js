import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      nav: {
        rooms: 'Habitaciones',
        availability: 'Disponibilidad',
        login: 'Iniciar Sesión',
        register: 'Registrarse',
        logout: 'Cerrar Sesión'
      },
      home: {
        title: 'Bienvenido a Hotel Pacific Reef',
        subtitle: 'Tu paraíso en el océano',
        cta: 'Consultar Disponibilidad'
      },
      booking: {
        selectDates: 'Selecciona tus fechas',
        nights: 'noches',
        advance: 'Anticipo (30%)',
        balance: 'Saldo al check-in',
        pay: 'Pagar',
        confirm: 'Confirmar Reserva'
      },
      errors: {
        unavailable: 'Habitación no disponible para las fechas seleccionadas',
        loginRequired: 'Inicia sesión para continuar'
      }
    }
  },
  en: {
    translation: {
      nav: {
        rooms: 'Rooms',
        availability: 'Availability',
        login: 'Login',
        register: 'Register',
        logout: 'Logout'
      },
      home: {
        title: 'Welcome to Hotel Pacific Reef',
        subtitle: 'Your ocean paradise',
        cta: 'Check Availability'
      },
      booking: {
        selectDates: 'Select your dates',
        nights: 'nights',
        advance: 'Advance payment (30%)',
        balance: 'Balance at check-in',
        pay: 'Pay',
        confirm: 'Confirm Booking'
      },
      errors: {
        unavailable: 'Room not available for selected dates',
        loginRequired: 'Please login to continue'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // default
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;