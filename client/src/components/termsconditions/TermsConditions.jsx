import React from 'react';
import { FileText, Mail, Phone, MapPin, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* --- HEADER SECTION --- */}
            <div className="bg-[#03214a] text-white pt-12 pb-24 px-6 relative overflow-hidden">
                {/* Decorative Circle (Subtle) */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-12 -mt-12 pointer-events-none"></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-300 hover:text-white transition mb-6 text-sm"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                            <ShieldCheck size={40} className="text-[#5ce1e6]" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">Terms & Conditions</h1>
                            <p className="text-gray-300 mt-2 text-sm md:text-base">
                                Please read these terms carefully before using our services.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENT CONTAINER --- */}
            <div className="max-w-6xl mx-auto px-4 -mt-16 pb-12 relative z-20">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">

                    {/* Last Updated Bar */}
                    <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex justify-between items-center text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                            <FileText size={16} /> Legal Agreement
                        </span>
                        <span>Effective Date: November 26, 2025</span>
                        {/* Note: I updated the date to today, change if needed */}
                    </div>

                    {/* --- MAIN TEXT BODY --- */}
                    <div className="p-8 md:p-12 text-gray-700 leading-relaxed space-y-8">

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span>
                                Acceptance of Terms
                            </h2>
                            <p>
                                By accessing or using the Next Eye Opticals website or placing an order with us, you agree to be bound by these Terms & Conditions. If you do not agree, do not use the site or place orders.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">2</span>
                                Eligibility
                            </h2>
                            <p>
                                You represent that you are at least 18 years old or have legal parental/guardian consent to use this service.
                            </p>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">3</span>
                                Product Information & Availability
                            </h2>
                            <p className="mb-2">
                                We strive to provide accurate product descriptions, images, pricing, and availability. However, errors may occur.
                            </p>
                            <p>
                                We reserve the right to correct any errors, change or update information, or cancel orders even after confirmation if necessary.
                            </p>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">4</span>
                                Ordering & Payment
                            </h2>
                            <ul className="list-disc pl-12 space-y-2">
                                <li>By placing an order, you warrant that all information you provide (personal, prescription, payment) is accurate and complete.</li>
                                <li>You are responsible for paying all applicable charges including product price, taxes, and shipping fees.</li>
                                <li>We reserve the right to refuse or cancel any order at our discretion (e.g., product unavailable, pricing error, or suspected fraud).</li>
                            </ul>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">5</span>
                                Prescription & Eyewear Disclaimer
                            </h2>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
                                <p className="font-medium text-yellow-800 mb-1">Important Notice:</p>
                                <p className="text-sm">
                                    If ordering prescription eyewear, you must provide a valid prescription from a licensed eye-care professional.
                                    Next Eye Opticals is not liable for issues arising due to incorrect prescription data provided by the user.
                                </p>
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">6</span>
                                Intellectual Property
                            </h2>
                            <p>
                                All content on the website (text, images, design, logos) is property of Next Eye Opticals (or its partners) and is protected by applicable IP laws. You may not reproduce, modify, distribute, or create derivative works without explicit written consent from us.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">7</span>
                                Use of Website & Conduct
                            </h2>
                            <p>
                                You agree to use the site only for lawful purposes. You must not engage in misuse, hacking, posting harmful content, or interfering with site operations. You are responsible for maintaining the confidentiality of your account credentials.
                            </p>
                        </section>

                        {/* Sections 8, 9, 10 Combined for Brevity in Visuals */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <section>
                                <h2 className="text-lg font-bold text-[#03214a] mb-2">8. Third-Party Links</h2>
                                <p className="text-sm">
                                    Our site may contain links to external websites. Next Eye Opticals is not responsible for the content or policies of those sites.
                                </p>
                            </section>
                            <section>
                                <h2 className="text-lg font-bold text-[#03214a] mb-2">9. Limitation of Liability</h2>
                                <p className="text-sm">
                                    Next Eye Opticals shall not be liable for indirect, incidental, or consequential damages arising from your use of the site to the maximum extent permitted by law.
                                </p>
                            </section>
                        </div>

                        {/* Section 10 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">10</span>
                                Indemnification
                            </h2>
                            <p>
                                You agree to indemnify and hold Next Eye Opticals harmless from any claims, damages, losses, or expenses arising out of your violation of these Terms or misuse of the site.
                            </p>
                        </section>

                        {/* Section 11 & 12 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">11</span>
                                Governing Law & Changes
                            </h2>
                            <p className="mb-4">
                                We reserve the right to modify these Terms at any time. Changes take effect immediately upon posting.
                            </p>
                            <p>
                                These Terms are governed by the laws applicable in India. Any dispute shall be subject to the courts in <span className="font-bold text-black">Ramnad (Ramanathapuram), Tamil Nadu</span>.
                            </p>
                        </section>

                        <hr className="border-gray-200 my-8" />

                        {/* Section 13: Contact */}
                        <section className="bg-[#f0f9fa] border border-[#5ce1e6] rounded-xl p-6">
                            <h2 className="text-xl font-bold text-[#03214a] mb-4">13. Contact Information</h2>
                            <p className="mb-6 text-gray-600">
                                For any questions or concerns regarding these Terms, please contact us at:
                            </p>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-full shadow-sm text-[#03214a]">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase">Email</p>
                                        <a href="mailto:nxteyeopticals@gmail.com" className="text-[#03214a] font-medium hover:underline">
                                            nxteyeopticals@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-full shadow-sm text-[#03214a]">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase">Phone</p>
                                        <a href="tel:+917869369994" className="text-[#03214a] font-medium hover:underline">
                                            +91 7869369994
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-full shadow-sm text-[#03214a]">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase">Head Office</p>
                                        <p className="text-[#03214a] font-medium text-sm">
                                            75/1, MRM Complex, Faizal Nagar Road, Kenikarai,<br />Ramanathapuram-623504
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;