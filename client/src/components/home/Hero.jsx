import React from 'react';

const Hero = () => {
    return (
        <section className="relative h-screen w-full flex items-center justify-center bg-[#0f0f0f] overflow-hidden pt-16">
            {/* Dynamic Background Glow - Using your Primary Red */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#d9042815_0%,_transparent_60%)] blur-3xl" />

            <div className="container mx-auto px-6 flex flex-col items-center relative z-10 h-full justify-center">
                {/* Text Content */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                        Advanced <span className="text-[#d90428]">Vigi</span> Control
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-base md:text-lg">
                        Real-time monitoring and digital asset tracking. Experience the interface
                        designed for total visibility.
                    </p>
                </div>

                {/* --- THE DEMO SCREEN (Responsive & Screen-Fitted) --- */}
                <div className="relative w-full max-w-5xl group lg:h-[500px] h-[350px]">
                    {/* Outer Border Glow */}
                    <div className="absolute -inset-0.5 bg-[#d90428] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-700"></div>

                    <div className="relative h-full bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">

                        {/* Browser Top Bar */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#0f0f0f] border-b border-white/5">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#d90428]"></div>
                                <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                                <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                            </div>
                            <div className="bg-[#1a1a1a] rounded px-6 py-1 text-[10px] text-gray-500 font-mono tracking-widest border border-white/5">
                                DEMO.VIGI.INTERNAL
                            </div>
                            <div className="w-12"></div> {/* Spacer */}
                        </div>

                        {/* Dashboard Mockup Content */}
                        <div className="flex-1 p-4 md:p-6 grid grid-cols-12 gap-4 overflow-hidden">

                            {/* Sidebar Mockup */}
                            <div className="col-span-3 border-r border-white/5 pr-4 hidden md:flex flex-col gap-3">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-7 rounded-md transition-all duration-300 ${i === 0 ? 'bg-[#d90428]/20 border border-[#d90428]/30' : 'bg-white/5 hover:bg-white/10'}`}
                                    ></div>
                                ))}
                                <div className="mt-auto h-20 bg-gradient-to-t from-[#d90428]/10 to-transparent rounded-lg border border-[#d90428]/10"></div>
                            </div>

                            {/* Main Visualization Area */}
                            <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Active Nodes', color: '#d90428' },
                                        { label: 'Uptime', color: '#ffffff' },
                                        { label: 'Latency', color: '#d90428' }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-lg">
                                            <div className="text-[10px] uppercase text-gray-500 mb-1">{stat.label}</div>
                                            <div className="h-4 w-full rounded bg-white/10 overflow-hidden">
                                                <div
                                                    className="h-full bg-[#d90428]"
                                                    style={{ width: i === 1 ? '98%' : '65%', backgroundColor: i === 1 ? '#4ade80' : '#d90428' }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Graph/Demo Area */}
                                <div className="flex-1 bg-[#0f0f0f] rounded-lg border border-white/5 p-4 flex flex-col justify-between relative">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="h-4 w-32 bg-white/10 rounded"></div>
                                            <div className="h-2 w-20 bg-white/5 rounded"></div>
                                        </div>
                                        <div className="px-2 py-1 rounded bg-[#d90428] text-[10px] text-white font-bold animate-pulse">LIVE</div>
                                    </div>

                                    {/* Animated Bars */}
                                    <div className="h-32 flex items-end gap-2 px-2">
                                        {[60, 40, 75, 50, 90, 65, 85, 45, 70, 55, 80, 60].map((h, i) => (
                                            <div
                                                key={i}
                                                style={{ height: `${h}%` }}
                                                className="flex-1 bg-[#d90428] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;