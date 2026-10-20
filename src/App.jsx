import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Prices from './pages/Prices.jsx';
import Booking from './pages/Booking.jsx';
import Esim from './pages/Esim.jsx';
import MyBooking from './pages/MyBooking.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="prices" element={<Prices />} />
        <Route path="booking" element={<Booking />} />
        <Route path="esim" element={<Esim />} />
        <Route path="my-booking" element={<MyBooking />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
