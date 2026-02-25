import React from "react";
import trend1 from "/assets/trend/4.jpg";
import trend2 from "/assets/trend/5.jpg";
import trend3 from "/assets/trend/6.jpg";
import trend4 from "/assets/trend/7.jpg";
import trend5 from "/assets/trend/8.jpg";
import trend6 from "/assets/trend/9.jpg";

const WearTheTrend = () => {
    const trends = [
        {
            id: 1,
            // title: "BUY 1 GET 1 FREE",
            // subtitle: "ON ALL EYEGLASSES",
            img: trend1,
        },
        {
            id: 2,
            img: trend2,
        },
        {
            id: 3,
            img: trend3,
        },
        {
            id: 4,
            img: trend4,
        },
        {
            id: 5,
            img: trend5,
        },
        {
            id: 6,
            img: trend6,
        },
    ];

    return (
        <section className="bg-white py-16 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#5ce1e6]/20 blur-3xl rounded-full"></div>
            <div className="px-2 md:px-5">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold tracking-wide text-[#03214a] uppercase">
                        WEAR THE TREND
                    </h2>
                    <p className="text-gray-600 mt-3 text-lg max-w-xl mx-auto">
                        Our hottest collections.
                    </p>
                </div>
                {/* <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 uppercase tracking-wide">
                        WEAR THE TREND
                    </h2>
                    <p className="text-gray-500 mt-2 text-base md:text-lg">
                        Our hottest collections.
                    </p>
                </div> */}

                {/* Scrollable Cards Section */}
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                    <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide">
                        {trends.map((item) => (
                            <div
                                key={item.id}
                                className="group relative min-w-[250px] md:min-w-[300px] lg:min-w-[320px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl snap-center transition-all duration-300"
                            >
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <h3 className="text-white text-lg md:text-xl font-semibold">
                                        {item.title}
                                    </h3>
                                    {item.subtitle && (
                                        <p className="text-gray-200 text-sm mt-1">{item.subtitle}</p>
                                    )}
                                    <button className="mt-4 bg-white text-black px-5 py-2 text-sm font-medium rounded-full hover:bg-gray-200 transition">
                                        SHOP NOW
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WearTheTrend;
