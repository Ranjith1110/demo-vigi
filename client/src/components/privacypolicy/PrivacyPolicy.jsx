import React from 'react';
import { FileText, Mail, Phone, MapPin, Lock, ArrowLeft, Eye, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* --- HEADER SECTION --- */}
            <div className="bg-[#03214a] text-white pt-12 pb-24 px-6 relative overflow-hidden">
                {/* Decorative Circle */}
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
                            <Lock size={40} className="text-[#5ce1e6]" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
                            <p className="text-gray-300 mt-2 text-sm md:text-base">
                                How we collect, use, and protect your personal data.
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
                            <Shield size={16} /> Data Protection
                        </span>
                        <span>Effective Date: November 26, 2025</span>
                    </div>

                    {/* --- MAIN TEXT BODY --- */}
                    <div className="p-8 md:p-12 text-gray-700 leading-relaxed space-y-8">

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span>
                                Introduction
                            </h2>
                            <p>
                                Next Eye Opticals ("we", "us", "our") values your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our website or services.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">2</span>
                                What Data We Collect
                            </h2>

                            <div className="pl-4 border-l-2 border-gray-200 space-y-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">a. Personal Data (Voluntary)</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Name, email address, mailing address, phone number, city/state/ZIP.</li>
                                        <li>Eye-care related info and prescriptions, where applicable.</li>
                                        <li>Payment information (processed securely via payment gateways).</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">b. Usage & Technical Data (Automatic)</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Device information (IP address, browser type/version, OS).</li>
                                        <li>Browsing behavior: pages visited, time spent, referral data, and cookies.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">3</span>
                                How We Use Your Data
                            </h2>
                            <p className="mb-2">We may use your data for:</p>
                            <ul className="list-disc pl-10 space-y-2">
                                <li>Processing orders, delivering products, managing accounts, and order history.</li>
                                <li>Verifying prescriptions for eyewear orders (if required).</li>
                                <li>Communication: order confirmations, shipping updates, and customer support.</li>
                                <li>Improving our services, website performance, and user experience.</li>
                                <li>Marketing, promotions, or newsletters (only if you have consented).</li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">4</span>
                                Data Sharing & Disclosure
                            </h2>
                            <p className="mb-3">
                                We do not sell or rent your personal information. We may share data with:
                            </p>
                            <ul className="list-disc pl-10 space-y-2">
                                <li><strong>Service Providers:</strong> Payment gateways and logistics/shipping partners strictly to fulfill your order.</li>
                                <li><strong>Affiliates:</strong> Partner entities only if necessary and with consent.</li>
                                <li><strong>Legal Requirements:</strong> If required by law, regulatory bodies, or to protect our rights or property.</li>
                            </ul>
                        </section>

                        {/* Section 5 & 6 */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <section>
                                <h2 className="text-lg font-bold text-[#03214a] mb-2 flex items-center gap-2">
                                    <span className="bg-blue-100 text-[#03214a] w-6 h-6 flex items-center justify-center rounded-full text-xs">5</span>
                                    Data Retention
                                </h2>
                                <p className="text-sm">
                                    We retain your data only as long as needed for legitimate business purposes (order fulfillment, legal compliance). You may request deletion of your data by contacting us, subject to legal constraints.
                                </p>
                            </section>
                            <section>
                                <h2 className="text-lg font-bold text-[#03214a] mb-2 flex items-center gap-2">
                                    <span className="bg-blue-100 text-[#03214a] w-6 h-6 flex items-center justify-center rounded-full text-xs">6</span>
                                    Cookies
                                </h2>
                                <p className="text-sm">
                                    We use cookies to track usage, remember preferences, and analyze behavior. You may disable cookies via browser settings, though some site features may stop working.
                                </p>
                            </section>
                        </div>

                        {/* Section 7 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">7</span>
                                Security Measures
                            </h2>
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
                                <p className="text-sm text-green-800">
                                    We adopt reasonable technical measures to protect your data. Sensitive data (payment info) is transmitted securely using <strong>HTTPS encryption</strong>.
                                </p>
                            </div>
                        </section>

                        {/* Section 8 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">8</span>
                                Your Rights & Controls
                            </h2>
                            <ul className="list-disc pl-10 space-y-2">
                                <li>Access and review personal data we hold about you.</li>
                                <li>Request correction, update, or deletion of your data.</li>
                                <li>Revoke consent for marketing communications at any time.</li>
                                <li>Opt-out of non-essential cookies/tracking.</li>
                            </ul>
                        </section>

                        {/* Section 9 & 10 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">9</span>
                                Minors & Policy Changes
                            </h2>
                            <p className="mb-4">
                                <strong>Minors:</strong> Our services are intended for users 18+. We do not knowingly collect data from minors.
                            </p>
                            <p>
                                <strong>Updates:</strong> We reserve the right to update this policy. Changes are effective when posted with an updated "Effective Date". Your continued use constitutes acceptance.
                            </p>
                        </section>

                        {/* Section 11 */}
                        <section>
                            <h2 className="text-xl font-bold text-[#03214a] mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-[#03214a] w-8 h-8 flex items-center justify-center rounded-full text-sm">11</span>
                                Governing Law & Compliance
                            </h2>
                            <p>
                                Our data practices comply with applicable Indian laws. As of 2025, the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> governs digital personal data processing, including consent, user rights, and organizational obligations.
                            </p>
                        </section>

                        <hr className="border-gray-200 my-8" />

                        {/* Section 12: Contact */}
                        <section className="bg-[#f0f9fa] border border-[#5ce1e6] rounded-xl p-6">
                            <h2 className="text-xl font-bold text-[#03214a] mb-4">12. Contact for Privacy / Data Requests</h2>
                            <p className="mb-6 text-gray-600">
                                For any privacy-related requests (access, correction, deletion, opt-out) or concerns, please contact us at:
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

export default PrivacyPolicy;