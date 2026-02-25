import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaStar, FaCartPlus } from 'react-icons/fa';
import vincent from "/assets/vincent.webp";
import lacelle from "/assets/contact-lens/lacelle-lens.jpg";
import purevision from "/assets/contact-lens/purevision-lens.jpg";
import soft from "/assets/contact-lens/soft-lens.jpg";
import bio from "/assets/contact-lens/bio-true.jpg";
import renu from "/assets/contact-lens/renu.jpg";
import { useCart } from '../../context/CartContext';

const products = [
    {
        id: "cl-1",
        brand: "Lacelle",
        details: "Size: All • Lacelle Monthly",
        rating: 4.8,
        reviews: 22,
        price: 928,
        originalPrice: 999,
        discount: 0,
        colors: ["white"],
        image: lacelle
    },
    {
        id: "cl-2",
        brand: "PureVision",
        details: "Size: All • Bausch & Lomb",
        rating: 4.9,
        reviews: 52,
        price: 2526,
        originalPrice: 2999,
        discount: 0,
        colors: ["white"],
        image: purevision
    },
    {
        id: "cl-3",
        brand: "Soft",
        details: "Size: All • Soft Contact Lens",
        rating: 4.2,
        reviews: 10,
        price: 1499,
        originalPrice: 1900,
        discount: 0,
        colors: ["white"],
        image: soft
    },
    {
        id: "cl-4",
        brand: "BioTrue",
        details: "BioTrue Liquid",
        rating: 4.2,
        reviews: 10,
        price: 390,
        originalPrice: 500,
        discount: 0,
        colors: ["white"],
        image: bio
    },
    {
        id: "cl-5",
        brand: "Renu",
        details: "Renu Liquid",
        rating: 4.2,
        reviews: 10,
        price: 260,
        originalPrice: 300,
        discount: 0,
        colors: ["white"],
        image: renu
    }
];

// INDIVIDUAL CARD COMPONENT
const ProductCard = ({ product }) => {
    const [isLiked, setIsLiked] = useState(false);
    const { addToCart } = useCart(); // GET ADD FUNCTION

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
                    className="w-100 object-cover h-full"
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