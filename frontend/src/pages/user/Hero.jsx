import React from 'react'
import {assets, cities} from "../../assets/assets"

const Hero = () => {
  return (
    <section className="relative">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>
      
      {/* Background Image */}
      <div 
        className="relative z-10 flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-cover object-cover bg-center h-screen"
        style={{
          backgroundImage: 'url("https://i.pinimg.com/1200x/a6/90/9c/a6909cf47df97e0dddae61da00bc27db.jpg")'
        }}
      >
        {/* Content Container */}
        <div className="max-w-2xl space-y-6">
          {/* Badge */}
          <span className="inline-block bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-full px-4 py-2 text-sm font-medium tracking-wide">
            The Ultimate Hotel Experience the world
          </span>
          
          {/* Heading */}
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Discover Your Perfect Getaway Destination
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-xl">
            Unparalleled luxury and comfort await at the world's most exclusive hotels and resorts. Start your journey today.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Hero
