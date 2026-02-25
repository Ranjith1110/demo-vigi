import React from "react";

// Replace with your real logos (public or src paths)
import brand1 from "/assets/home-hero/ourbrands/1.png";
import brand2 from "/assets/home-hero/ourbrands/2.png";
import brand3 from "/assets/home-hero/ourbrands/3.png";
import brand4 from "/assets/home-hero/ourbrands/4.png";
import brand5 from "/assets/home-hero/ourbrands/5.png";
import brand6 from "/assets/home-hero/ourbrands/6.png";
import brand7 from "/assets/home-hero/ourbrands/7.png";
import brand8 from "/assets/home-hero/ourbrands/8.png";
import brand9 from "/assets/home-hero/ourbrands/9.png";
import brand10 from "/assets/home-hero/ourbrands/10.png";
import brand11 from "/assets/home-hero/ourbrands/11.png";

const OurBrands = () => {
    const baseBrands = [
        { id: 1, img: brand1, name: "" },
        { id: 2, img: brand2, name: "" },
        { id: 3, img: brand3, name: "" },
        { id: 4, img: brand4, name: "" },
        { id: 5, img: brand5, name: "" },
        { id: 6, img: brand6, name: "" },
        { id: 7, img: brand7, name: "" },
        { id: 8, img: brand8, name: "" },
        { id: 9, img: brand9, name: "" },
        { id: 10, img: brand10, name: "" },
        { id: 11, img: brand11, name: "" }
    ];

    const brands = [...baseBrands, ...baseBrands];

    return (
        <section className="py-16 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
            <style>{`
        /* Keyframes: translate the track left by 50% (we duplicated content) */
        @keyframes nxteye-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* track uses transform (GPU) so it's smooth */
        .nxteye-scroll-track {
          display: flex;
          gap: 4rem; /* matches Tailwind gap-16 */
          align-items: center;
          width: max-content;
          animation: nxteye-scroll 28s linear infinite;
        }

        /* Pause on hover */
        .nxteye-scroll-track:hover {
          animation-play-state: paused;
        }

        /* Hide scrollbar for most browsers */
        .nxteye-scroll-viewport {
          overflow: hidden; /* hide native scroll - we rely on animation */
        }
        .nxteye-hide-scrollbar {
          -ms-overflow-style: none;  /* IE/Edge */
          scrollbar-width: none;     /* Firefox */
        }
        .nxteye-hide-scrollbar::-webkit-scrollbar { display: none; } /* Chrome/Safari */

        /* small screens: slightly slower/shorter animation */
        @media (max-width: 640px) {
          .nxteye-scroll-track { animation-duration: 35s; gap: 2.5rem; }
        }
      `}</style>

            <div className="absolute inset-0 mx-auto w-[500px] h-[500px] bg-[#5ce1e6]/25 blur-3xl opacity-40 pointer-events-none"></div>

            <div className="relative">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-[#03214a] tracking-wide">
                        Our Brands
                    </h2>
                    <p className="text-gray-600 text-lg mt-3">
                        Premium eyewear brands trusted for quality & innovation.
                    </p>
                </div>

                {/* Smooth Infinite Slider (viewport) */}
                <div className="nxteye-scroll-viewport nxteye-hide-scrollbar">
                    <div className="nxteye-scroll-track">
                        {brands.map((brand, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-center min-w-[100px] h-[90px] transform transition-transform duration-300 hover:scale-110"
                                title={brand.name}
                            >
                                <img
                                    src={brand.img}
                                    alt={brand.name}
                                    className="w-auto h-full object-contain opacity-90 hover:opacity-100"
                                    style={{ filter: "contrast(0.95)" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OurBrands;
