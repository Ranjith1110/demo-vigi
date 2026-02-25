import React from "react";
import {
    ShieldCheck,
    Cpu,
    Users,
    BadgeCheck
} from "lucide-react";

const WhyNxTEye = () => {
    const highlights = [
        {
            id: 1,
            icon: <ShieldCheck size={48} strokeWidth={1.5} className="text-[#03214a]" />,
            title: "Premium Quality Frames",
            description:
                "Top-tier frames crafted with superior materials and curated with the latest eyewear trends."
        },
        {
            id: 2,
            icon: <Cpu size={48} strokeWidth={1.5} className="text-[#03214a]" />,
            title: "Advanced Lens Technology",
            description:
                "Blue-cut, anti-glare, ultra-thin and precision optics powered by modern technology."
        },
        {
            id: 3,
            icon: <Users size={48} strokeWidth={1.5} className="text-[#03214a]" />,
            title: "Customer-First Experience",
            description:
                "Expert optometrists, friendly staff, and seamless after-sales support designed around your comfort."
        },
        {
            id: 4,
            icon: <BadgeCheck size={48} strokeWidth={1.5} className="text-[#03214a]" />,
            title: "Best Value Guarantee",
            description:
                "Fair pricing, premium quality, transparent billing, and trusted warranty on every purchase."
        }
    ];

    return (
        <section className="relative py-16 bg-white overflow-hidden">
            <div className="absolute inset-0 mx-auto w-[500px] h-[500px] bg-[#5ce1e6]/20 blur-3xl rounded-full opacity-50 pointer-events-none"></div>
            <div className="px-4 md:px-8 max-w-7xl mx-auto">

                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-[#03214a] tracking-wide">
                        Why NxTEye?
                    </h2>
                    <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
                        Discover what sets us apart and why customers trust NxTEye for their eyewear.
                    </p>
                </div>

                {/* Highlights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {highlights.map((item) => (
                        <div
                            key={item.id}
                            className="bg-[#f9fbfd] p-8 rounded-3xl text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex justify-center mb-4">
                                {item.icon}
                            </div>

                            <h3 className="text-xl font-semibold text-[#03214a] mb-2">
                                {item.title}
                            </h3>

                            <p classname="text-gray-600 text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}

                </div>
            </div>
        </section>
    );
};

export default WhyNxTEye;
