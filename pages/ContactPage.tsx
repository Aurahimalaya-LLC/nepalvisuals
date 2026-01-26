
import React from 'react';

const FaqItem: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <details className="group bg-surface-dark rounded-xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-primary/30 open:bg-surface-darker/50">
        <summary className="flex justify-between items-center p-5 cursor-pointer list-none text-base font-bold text-white select-none">
            <span>{title}</span>
            <span className="material-symbols-outlined text-text-secondary transition-transform duration-300 group-open:rotate-180 group-open:text-primary">expand_more</span>
        </summary>
        <div className="px-5 pb-5 text-text-secondary leading-relaxed border-t border-white/10 mt-2 pt-4 text-sm">
            {children}
        </div>
    </details>
);


const ContactPage: React.FC = () => {
    return (
         <>
            <header className="relative -mt-[100px] min-h-[50vh] flex items-center justify-center overflow-hidden rounded-b-2xl md:rounded-b-[3rem]">
                <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://placehold.co/1600x900?text=Contact+Header')" }}></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent"></div>
                <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
                        Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-primary">Touch</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto font-medium drop-shadow-md">
                        Have a question, a comment, or ready to start your adventure? We're here to help.
                    </p>
                </div>
            </header>
            <main className="flex-grow pt-16 pb-16 px-4 md:px-8 lg:px-16 container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-surface-dark border border-white/5 rounded-3xl p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-white mb-6">Send us a Message</h2>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-text-secondary mb-2 block font-bold uppercase tracking-wider">Full Name</label>
                                    <input type="text" placeholder="John Doe" className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary transition" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-secondary mb-2 block font-bold uppercase tracking-wider">Email Address</label>
                                    <input type="email" placeholder="you@example.com" className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary transition" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-text-secondary mb-2 block font-bold uppercase tracking-wider">Subject</label>
                                <input type="text" placeholder="e.g., Question about Everest Base Camp Trek" className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary transition" />
                            </div>
                            <div>
                                <label className="text-xs text-text-secondary mb-2 block font-bold uppercase tracking-wider">Your Message</label>
                                <textarea placeholder="How can we help you plan your adventure?" rows={5} className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary transition"></textarea>
                            </div>
                            <div>
                                <button type="submit" className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group">
                                    Send Message
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-8">
                         <div className="bg-surface-dark border border-white/5 rounded-3xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                             <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary text-3xl mt-1">location_on</span>
                                    <div>
                                        <h4 className="font-bold text-white">Our Office</h4>
                                        <p className="text-text-secondary">123 Adventure Marg, Thamel, Kathmandu 44600, Nepal</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary text-3xl mt-1">call</span>
                                     <div>
                                        <h4 className="font-bold text-white">Phone</h4>
                                        <a href="tel:+97714423456" className="text-text-secondary hover:text-primary transition-colors">+977 1 442 3456</a>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary text-3xl mt-1">mail</span>
                                     <div>
                                        <h4 className="font-bold text-white">Email</h4>
                                        <a href="mailto:hello@nepalvisuals.com" className="text-text-secondary hover:text-primary transition-colors">hello@nepalvisuals.com</a>
                                    </div>
                                </li>
                             </ul>
                        </div>
                        <div className="bg-surface-dark border border-white/5 rounded-3xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
                            <div className="space-y-3">
                                <FaqItem title="What fitness level is required?">
                                     Fitness requirements vary by trek. For easier treks, a moderate fitness level is sufficient. For challenging expeditions, we recommend a solid cardio routine for at least 3 months prior.
                                </FaqItem>
                                <FaqItem title="Do I need travel insurance?">
                                    Yes, comprehensive travel insurance is mandatory. It must cover emergency medical evacuation up to the maximum altitude of your trek.
                                </FaqItem>
                            </div>
                        </div>

                        <div className="rounded-3xl overflow-hidden border border-white/5">
                           <img src="https://i.imgur.com/u7p6bCj.png" alt="Map showing location in Kathmandu" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </main>
         </>
    );
};

export default ContactPage;
