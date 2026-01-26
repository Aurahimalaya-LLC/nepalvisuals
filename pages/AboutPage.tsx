
import React from 'react';
import { Link } from 'react-router-dom';

const teamMembers = [
    { name: 'Pasang Sherpa', role: 'Founder & Lead Guide', image: 'https://randomuser.me/api/portraits/men/34.jpg' },
    { name: 'Maya Gurung', role: 'Operations Manager', image: 'https://randomuser.me/api/portraits/women/22.jpg' },
    { name: 'Tenzing Norgay', role: 'Senior Expedition Leader', image: 'https://randomuser.me/api/portraits/men/36.jpg' },
    { name: 'Anjali Shrestha', role: 'Customer Experience Lead', image: 'https://randomuser.me/api/portraits/women/24.jpg' },
];

const testimonials = [
    { name: 'Sarah Jenkins', review: 'An absolutely life-changing experience. The guides from Nepal Visuals were professional, knowledgeable, and incredibly supportive.', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { name: 'Marcus Chau', review: 'This was my first high-altitude trek and I couldn\'t have chosen a better company. The itinerary was perfectly paced with acclimatization days.', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
    { name: 'Priya Ayyangar', review: 'Incredible trek with stunning scenery. The organization was top-notch from start to finish. The team handled everything professionally.', avatar: 'https://randomuser.me/api/portraits/women/79.jpg' },
];

const partners = [
    { name: 'Himalayan Advenure', logo: 'https://i.imgur.com/3Cn1g28.png' },
    { name: 'EcoTrek Global', logo: 'https://i.imgur.com/3Cn1g28.png' },
    { name: 'Summit International', logo: 'https://i.imgur.com/3Cn1g28.png' },
    { name: 'Porter Welfare Fund', logo: 'https://i.imgur.com/3Cn1g28.png' },
];

const AboutPage: React.FC = () => {
    return (
        <>
            <header className="relative -mt-[100px] min-h-[60vh] flex items-center justify-center overflow-hidden rounded-b-2xl md:rounded-b-[3rem]">
                <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB7oJvicfMYF2tTDspjyC_dNc6L_u3AS3u1gLba-Lnwk50u3YZOQu3BkxHIjp6qOm8t6-NdGiFKjAxtFwVL1N5XTTmnRQEsYogfMQZfRLPcoYucuMk0ybPhdPiwooV3LVT_bSwr3Ld2FpmTFJP4MwAgLfiztLA7j1qaUiTbpBEa-bWWzUGuIU_wFBqd0T-S_5J3Xle-0CUZZp84IdPuI3fpZyaG0t50baFmMaApe8X6CrvYDROuk7W1PI6KncjUpZ3zKUnhjmCd4hWa')" }}></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent"></div>
                <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-primary">Nepal Visuals</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto font-medium drop-shadow-md">
                        More than a trekking company. We are storytellers, conservationists, and your trusted guides to the heart of the Himalayas.
                    </p>
                </div>
            </header>

            <main className="flex-grow pt-16 pb-16 px-4 md:px-8 lg:px-16 container mx-auto max-w-7xl space-y-24">
                <section className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Real Stories. Real Treks. <span className="text-primary">Real Nepal.</span></h2>
                    <div className="bg-surface-dark border border-white/5 rounded-3xl p-8 md:p-12 text-left space-y-6 text-text-secondary leading-relaxed">
                        <p><strong className="text-white">Nepal Visuals</strong> was born from a simple desire: to share the profound, life-altering beauty of the Himalayas with the world, but to do it the <strong className="text-white">right way</strong>. Our founder, a seasoned guide with over two decades on the trail, saw a gap between commercial tourism and authentic, sustainable adventure.</p>
                        <p>We set out to build a company that respects the mountains, empowers local communities, and provides trekkers with an experience that goes beyond just the trail. We believe a trek is a story, and we're here to help you write an unforgettable one.</p>
                        <Link to="/contact" className="inline-block text-primary font-bold hover:underline">Read our full story here &rarr;</Link>
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">Our Mission & Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="bg-surface-dark p-8 rounded-2xl border border-white/5">
                            <div className="w-14 h-14 rounded-full bg-secondary text-white flex items-center justify-center mb-6 shadow-lg shadow-secondary/30">
                                <span className="material-symbols-outlined text-3xl">eco</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Eco-Friendly Treks</h3>
                            <p className="text-text-secondary leading-relaxed">Prioritizing sustainable practices to protect the pristine environments we explore for future generations.</p>
                        </div>
                        <div className="bg-surface-dark p-8 rounded-2xl border border-white/5">
                            <div className="w-14 h-14 rounded-full bg-secondary text-white flex items-center justify-center mb-6 shadow-lg shadow-secondary/30">
                                <span className="material-symbols-outlined text-3xl">verified_user</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Certified Guides</h3>
                            <p className="text-text-secondary leading-relaxed">Our local experts bring years of experience and deep cultural knowledge to every expedition.</p>
                        </div>
                        <div className="bg-surface-dark p-8 rounded-2xl border border-white/5">
                            <div className="w-14 h-14 rounded-full bg-secondary text-white flex items-center justify-center mb-6 shadow-lg shadow-secondary/30">
                                <span className="material-symbols-outlined text-3xl">medical_services</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Safety First</h3>
                            <p className="text-text-secondary leading-relaxed">Comprehensive safety protocols and top-tier equipment ensure your peace of mind.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Meet the Team</h2>
                        <p className="text-text-secondary">The experienced professionals who will guide your journey and make your challenge a success.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="group text-center">
                                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-4 border-surface-dark group-hover:border-primary transition-colors duration-300">
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                                </div>
                                <h3 className="text-lg font-bold text-white">{member.name}</h3>
                                <p className="text-sm text-primary">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </section>
                
                <section className="bg-surface-dark border border-white/5 rounded-3xl p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6">Trekking for a <span className="text-primary">Greener Tomorrow</span></h2>
                            <p className="text-text-secondary leading-relaxed mb-6">Our commitment to the Himalayas goes beyond the trails. We actively work to preserve its beauty and support its communities.</p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-green-500">check_circle</span> <span className="text-white">Porter Welfare Initiatives</span></li>
                                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-green-500">check_circle</span> <span className="text-white">Community-Owned Teahouses</span></li>
                                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-green-500">check_circle</span> <span className="text-white">Zero Waste Treks</span></li>
                            </ul>
                        </div>
                        <div className="relative aspect-square rounded-2xl overflow-hidden">
                            <img src="https://placehold.co/800x800?text=Himalayan+Peak" alt="Pristine mountain peak with clear skies" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Stories from the Trail</h2>
                        <p className="text-text-secondary">Don't just take our word for it. Here's what our adventurers say.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                             <div key={i} className="bg-surface-dark p-6 rounded-2xl border border-white/5 flex flex-col">
                                <div className="flex items-center mb-4">
                                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                                    <div>
                                        <h4 className="font-bold text-white">{t.name}</h4>
                                        <div className="flex text-primary">
                                            {[...Array(5)].map((_, i) => <span key={i} className="material-symbols-outlined text-sm">star</span>)}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-text-secondary leading-relaxed flex-grow">"{t.review}"</p>
                            </div>
                        ))}
                    </div>
                </section>
                
                <section>
                     <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Our Trusted Partners</h2>
                        <p className="text-text-secondary">We collaborate with the best to ensure the highest standards of safety and service.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {partners.map((p, i) => (
                            <div key={i} className="bg-surface-dark p-6 rounded-2xl border border-white/5 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                <img src={p.logo.replace("h-10", "h-8")} alt={p.name} className="max-h-12" />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-gradient-to-br from-secondary to-primary rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-5"></div>
                    <h2 className="text-3xl font-bold text-white mb-4">Join our tribe of <br /> Explorers</h2>
                    <p className="text-white/80 max-w-xl mx-auto mb-8">Subscribe to our newsletter for the latest treks, exclusive offers, and early-bird discounts. No spam, just adventure.</p>
                    <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                        <input className="flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:ring-1 focus:ring-white focus:border-white text-sm outline-none transition-all" placeholder="Your email address" type="email" />
                        <button className="bg-white text-background-dark font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors shadow-lg">
                            Subscribe to Newsletter
                        </button>
                    </form>
                </section>

            </main>
        </>
    );
};

export default AboutPage;
