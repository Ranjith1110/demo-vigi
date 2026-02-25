import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaStar, FaCartPlus } from 'react-icons/fa';
import vincent from "/assets/vincent.webp";
import fastrack1 from "/assets/sun-glasses/fastrack1.png";
import fastrack2 from "/assets/sun-glasses/fastrack2.png";
import fastrack3 from "/assets/sun-glasses/fastrack3.png";
import kosch1 from "/assets/sun-glasses/kosch-polarized-sunglass1.png";
import kosch2 from "/assets/sun-glasses/kosch-polarized-sunglass2.png";
import kosch from "/assets/sun-glasses/kosch.png";
import { useCart } from '../../context/CartContext';

// MOCK DATA SECTION
const products = [
    {
        id: "sg-1",
        brand: "Fastrack ",
        details: "Size: Medium • Fastrack Sunglasses",
        rating: 4.3,
        reviews: 162,
        price: 1750,
        originalPrice: 1900,
        discount: 0,
        colors: ["blue"],
        image: fastrack1
    },
    {
        id: "sg-2",
        brand: "Fastrack",
        details: "Size: Wide • Fastrack Sunglasses",
        rating: 4.9,
        reviews: 52,
        price: 1550,
        originalPrice: 1700,
        discount: 0,
        colors: ["black"],
        image: fastrack2
    },
    {
        id: "sg-3",
        brand: "Fastrack",
        details: "Size: Narrow • Fastrack Sunglasses",
        rating: 4.4,
        reviews: 569,
        price: 1650,
        originalPrice: 1800,
        discount: 0,
        colors: ["black"],
        image: fastrack3
    },
    {
        id: "sg-4",
        brand: "Kosch",
        details: "Size: Narrow • Kosch Polarized Sunglasses",
        rating: 4.4,
        reviews: 69,
        price: 4300,
        originalPrice: 4800,
        discount: 0,
        colors: ["black"],
        image: kosch1
    },
    {
        id: "sg-5",
        brand: "Kosch",
        details: "Size: Narrow • Kosch Polarized Sunglasses",
        rating: 4.2,
        reviews: 69,
        price: 4300,
        originalPrice: 4600,
        discount: 0,
        colors: ["brown"],
        image: kosch2
    },
    {
        id: "sg-6",
        brand: "Kosch",
        details: "Size: Narrow • Kosch Polarized Sunglasses",
        rating: 4.0,
        reviews: 69,
        price: 4400,
        originalPrice: 4700,
        discount: 0,
        colors: ["brown"],
        image: kosch
    }
];

// INDIVIDUAL CARD COMPONENT
const ProductCard = ({ product }) => {
    const [isLiked, setIsLiked] = useState(false);
    const { addToCart } = useCart();

    return (
        <div className="group relative bg-white border border-gray-200 rounded-xl p-4 transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between h-full">

            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                }}
                className="absolute top-4 right-4 z-10 p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
                {isLiked ? <FaHeart className="text-red-500 text-xl" /> : <FaRegHeart className="text-xl" />}
            </button>

            <div className="relative w-full h-52 flex items-center justify-center overflow-visible mb-4">

                <img
                    src={product.image}
                    alt={product.brand}
                    onError={(e) => e.target.src = "https://via.placeholder.com/300x150?text=No+Image"}
                    className="w-[85%] object-contain transform -rotate-6 scale-95 transition-transform duration-500 ease-in-out group-hover:rotate-0 group-hover:scale-105"
                />

                <div className="absolute bottom-0 left-0 bg-gray-50 border border-gray-100 rounded-full px-2 py-2px flex items-center gap-1 shadow-sm">
                    <span className="font-bold text-[13px] text-gray-800">{product.rating}</span>
                    <FaStar className="text-teal-500 text-[10px] mb-1px" />
                    <span className="text-[11px] text-gray-500 border-l border-gray-300 pl-1 ml-1">{product.reviews}</span>
                </div>
            </div>

            <div className="mt-1 text-left">
                <h3 className="text-[17px] font-bold text-gray-800 mb-1 leading-tight">{product.brand}</h3>
                <p className="text-[13px] text-gray-500 font-medium mb-4 truncate">{product.details}</p>

                <div className="flex items-end justify-between">

                    <div className="flex items-baseline gap-6px">
                        <span className="text-[17px] font-bold text-gray-900">₹{product.price}</span>
                        <span className="text-[13px] text-gray-400 line-through font-medium">₹{product.originalPrice}</span>
                        <span className="text-[13px] text-teal-600 font-bold">({product.discount}% OFF)</span>
                    </div>

                    <div className="flex items-center -space-x-6px">
                        {product.colors.map((color, idx) => (
                            <div
                                key={idx}
                                className="w-5 h-5 rounded-full border-2px border-white shadow-sm bg-cover"
                                style={{ backgroundColor: color }}
                            ></div>
                        ))}
                        {product.extraColors && (
                            <div className="w-5 h-5 rounded-full border-2px border-white bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-600 shadow-sm z-10">
                                +{product.extraColors}
                            </div>
                        )}
                    </div>

                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                    }}
                    className="mt-3 w-full bg-teal-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors active:scale-95 shadow-md"
                >
                    <FaCartPlus className="text-sm" />
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

// MAIN SECTION COMPONENT
export default function Product() {
    return (
        <section className="py-12 px-4 md:px-8 bg-gray-50/50 mt-8 md:mt-16">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold tracking-wide text-[#03214a] uppercase">
                        Products
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

            </div>
        </section>
    );
}