import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CustomerReviews = () => {
    const reviews = [
        {
            id: 1,
            name: "Prakash S.",
            review:
                "Great service and very professional. The eye test was accurate and the glasses fit perfectly!",
            stars: 5,
        },
        {
            id: 2,
            name: "Mahesh Kumar",
            review:
                "Best optical experience I’ve ever had. Friendly team and premium quality frames.",
            stars: 5,
        },
        {
            id: 3,
            name: "Deepika R",
            review:
                "Loved the collection! Quick service and the staff explained everything clearly.",
            stars: 4,
        },
        {
            id: 4,
            name: "Srinidhi",
            review:
                "Affordable pricing with top brands. Delivery was very fast. Highly recommended!",
            stars: 5,
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // 1 = next, -1 = previous

    const nextReview = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
    };

    const prevReview = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
    };

    // Framer motion variants
    const variants = {
        enter: (direction) => ({
            opacity: 0,
            x: direction === 1 ? 50 : -50,
            scale: 0.95,
        }),
        center: {
            opacity: 1,
            x: 0,
            scale: 1,
        },
        exit: (direction) => ({
            opacity: 0,
            x: direction === 1 ? -50 : 50,
            scale: 0.95,
        }),
    };

    return (
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#5ce1e6]/20 blur-3xl opacity-50 rounded-full"></div>

            <div className="relative px-6 md:px-10 max-w-5xl mx-auto">
                <div className="text-center mb-14">
                    <h2 className="text-4xl font-extrabold text-[#03214a] tracking-wide">
                        Customer Reviews
                    </h2>
                    <p className="text-gray-600 text-lg mt-3 max-w-xl mx-auto">
                        Hear what our amazing customers have to say about their NxTEye experience.
                    </p>
                </div>

                {/* Carousel */}
                <div className="relative flex items-center justify-center">
                    <button
                        onClick={prevReview}
                        className="absolute left-0 bg-white shadow-md hover:shadow-lg p-3 rounded-full border border-gray-200 hover:bg-gray-100 transition z-10"
                    >
                        <ChevronLeft size={22} className="text-[#03214a]" />
                    </button>

                    <div className="w-full max-w-md mx-auto h-[260px] flex items-center justify-center">
                        <AnimatePresence custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.4 }}
                                className="absolute w-full max-w-md p-8 rounded-3xl backdrop-blur-md bg-white/60 border border-white/20 shadow-xl"
                            >
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: reviews[currentIndex].stars }).map((_, i) => (
                                        <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>

                                <p className="text-gray-700 text-base leading-relaxed mb-6">
                                    "{reviews[currentIndex].review}"
                                </p>

                                <h4 className="text-[#03214a] font-semibold text-lg text-right">
                                    — {reviews[currentIndex].name}
                                </h4>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={nextReview}
                        className="absolute right-0 bg-white shadow-md hover:shadow-lg p-3 rounded-full border border-gray-200 hover:bg-gray-100 transition z-10"
                    >
                        <ChevronRight size={22} className="text-[#03214a]" />
                    </button>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-2 mt-6">
                    {reviews.map((_, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                setDirection(i > currentIndex ? 1 : -1);
                                setCurrentIndex(i);
                            }}
                            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${currentIndex === i ? "bg-[#03214a] scale-110" : "bg-gray-300"
                                }`}
                        ></div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CustomerReviews;
