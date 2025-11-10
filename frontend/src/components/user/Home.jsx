import React from 'react'
import { Route, Routes } from "react-router-dom";
import Feature from '../../pages/user/Feature';
import Rooms from './Rooms';
import India from '../../pages/user/India';
import World from '../../pages/user/World';
import Property from '../../pages/user/Property';
import Hero from '../../pages/user/Hero';


const Home = () => {
  return (
    <div>
      <Hero />
      <Feature/>
      <Routes>
        <Route to="/" element={<Feature />} />
        <Route to="/roooms" element={<Rooms />} />
      </Routes>
      <India />
      <World />
      <Property />
    </div>
  )
}

export default Home
