import React from "react";
import offerBanner from "/assets/home-hero/buyonegetone.png";

const LimitedTimeOffers = () => {
  return (
    <section className="relative py-16 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
      
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#5ce1e6]/20 blur-3xl rounded-full"></div>

      <div className="px-4 md:px-8 max-w-6xl mx-auto relative">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold tracking-wide text-[#03214a] uppercase">
            Limited Time Offers
          </h2>
          <p className="text-gray-600 mt-3 text-lg max-w-xl mx-auto">
            Exclusive deals on top eyewear collections. Don’t miss out — offer ends soon!
          </p>
        </div>

        {/* Banner Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl group cursor-pointer">
          
          {/* Image */}
          <img
            src={offerBanner}
            alt="Limited Time Offers"
            className="w-full h-[380px] object-cover transform group-hover:scale-105 transition-all duration-700"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-black/20"></div>

          {/* Text Overlay */}
          {/* <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-xl leading-tight">
              Up to <span className="text-[#5ce1e6]">50% OFF</span> on Select Frames
            </h3>

            <p className="text-gray-200 mt-4 text-lg max-w-md">
              Shop premium eyewear at unbeatable prices. Hurry before stock runs out!
            </p>

            <button className="mt-6 w-fit px-8 py-3 rounded-full bg-[#5ce1e6] text-[#03214a] text-sm font-semibold shadow-md hover:bg-[#03214a] hover:text-white transition-all duration-300">
              SHOP OFFER
            </button>
          </div> */}
        </div>

      </div>
    </section>
  );
};

export default LimitedTimeOffers;
