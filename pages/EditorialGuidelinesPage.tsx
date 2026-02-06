import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/layout/Layout';

const EditorialGuidelinesPage: React.FC = () => {
    return (
        <Layout>
            <Helmet>
                <title>Editorial Guidelines | Nepal Visuals</title>
                <meta name="description" content="Our commitment to accuracy, transparency, and quality in travel content." />
                <meta name="robots" content="noindex, follow" />
            </Helmet>

            <div className="bg-white min-h-screen py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Editorial Guidelines</h1>
                    
                    <div className="prose prose-lg prose-blue text-gray-600">
                        <p className="lead text-xl text-gray-800 mb-8">
                            At Nepal Visuals, we are committed to providing accurate, inspiring, and responsible travel information about Nepal. Our editorial process is designed to ensure that every piece of content we publish meets the highest standards of quality and integrity.
                        </p>

                        <h3>1. Accuracy and Fact-Checking</h3>
                        <p>
                            We strive to ensure that all information on our site is accurate at the time of publication. Our writers and editors verify facts, including prices, opening hours, and travel requirements, to the best of their ability. However, travel details can change rapidly, and we encourage travelers to double-check critical information before their trip.
                        </p>

                        <h3>2. Independence and Transparency</h3>
                        <p>
                            We maintain a clear distinction between editorial content and sponsored material. If a post or review is sponsored or if we have received a press trip or complimentary service, we will clearly disclose this relationship at the beginning of the article. Our opinions are always our own.
                        </p>

                        <h3>3. Cultural Respect and Responsibility</h3>
                        <p>
                            Nepal is a country with deep cultural traditions and spiritual significance. We are dedicated to promoting responsible tourism that respects local customs, supports local communities, and minimizes environmental impact. Our content reflects these values, encouraging travelers to be mindful guests.
                        </p>

                        <h3>4. Originality</h3>
                        <p>
                            We produce original content based on first-hand experiences and thorough research. We do not tolerate plagiarism. Any external sources or data used in our articles are properly attributed.
                        </p>

                        <h3>5. Updates and Corrections</h3>
                        <p>
                            We regularly review and update our evergreen content to ensure it remains relevant. If we discover a factual error in our published content, we will correct it promptly and, where appropriate, add a note indicating the update.
                        </p>

                        <h3>6. User-Generated Content</h3>
                        <p>
                            Comments and reviews from our community are welcomed and valued. However, we reserve the right to moderate or remove content that is hateful, spammy, or irrelevant to the conversation.
                        </p>

                        <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Have questions or feedback?</h4>
                            <p className="mb-4">
                                If you have any questions about our editorial process or would like to report an inaccuracy, please contact our editorial team.
                            </p>
                            <a href="/contact" className="text-primary-600 font-bold hover:text-primary-700">
                                Contact Us &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EditorialGuidelinesPage;
