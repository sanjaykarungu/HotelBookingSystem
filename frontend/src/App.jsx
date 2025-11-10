import React from 'react'
import { Route, Routes, useLocation } from "react-router-dom";
import Home from './components/user/Home';
import About from './components/user/About';
import Contact from './components/user/Contact';
import Register from './components/authentication/Register';
import Login from './components/authentication/Login';
import AddCart from './pages/user/AddCart';
import Rooms from './components/user/Rooms';
import RoomDetails from './pages/user/RoomDetails';
import Booking from './pages/user/Booking';
import Country from './pages/user/Country';
import CountryRoomDetails from './pages/user/CountryRoomDetails';
import States from './pages/user/States';
import StatesRoomDetails from './pages/user/StatesRoomDetails';
import PropertyType from './pages/user/PropertyType';
import PropertyRoomDetails from './pages/user/PropertyRoomDetails';
import Navbar from './components/user/Navbar';
import Footer from './components/user/Footer';
import Dashboard from './components/admin/Dashboard';
import AddHotel from './pages/admin/AddHotel';
import Hotel from './pages/admin/Hotel';
import Order from './pages/admin/Order';
import EditHotel from './pages/admin/EditHotel';
import Profile from './components/authentication/Profile';

const App = () => {
  const location = useLocation();
  
  // Check if current path is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin') || 
                       location.pathname.startsWith('/add') || 
                       location.pathname.startsWith('/hotels') || 
                       location.pathname.startsWith('/orders')||
                       location.pathname.startsWith('/admin/edit-hotel/:id');

  return (
    <div>
      {/* Only show Navbar if not on admin routes */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/addcart" element={<AddCart />} />
        
        {/* Admin Routes */}
        
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/add" element={<AddHotel />} />
        <Route path="/hotels" element={<Hotel/>} />
        <Route path="/orders" element={<Order/>} />
        <Route path="/admin/edit-hotel/:id" element={<EditHotel />} />

        <Route path="/rooms" element={<Rooms/>} />
        <Route path="/rooms/:id" element={<RoomDetails />} />

        <Route path="/states/:id" element={<States />} />
        <Route path="/states/:stateId/hotels/:hotelId" element={<StatesRoomDetails />}/>
        
        <Route path="/country/:id" element={<Country/>}/>
        <Route path="/country/:countryId/hotels/:hotelId" element={<CountryRoomDetails/>}/>

        <Route path="/property/:id" element={<PropertyType/>}/>
        <Route path="/property/:propertyId/hotels/:hotelId" element={<PropertyRoomDetails/>}/>

        <Route path="/booking" element={<Booking/>} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<Profile />} />

      </Routes>

      {/* Only show Footer if not on admin routes */}
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App