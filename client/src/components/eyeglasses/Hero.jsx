import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative w-full h-[80vh] md:h-[55vh] flex items-center justify-center overflow-hidden bg-gray-900">

      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=2072&auto=format&fit=crop"
          alt="Premium Eyeglasses"
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <span className="block text-blue-400 font-semibold tracking-widest uppercase text-sm mb-3">
          New Collection
        </span>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Frame Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
            Unique Vision
          </span>
        </h1>

        <p className="text-gray-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Discover frames that blend timeless elegance with modern comfort.
        </p>
      </div>
    </section>
  );
}