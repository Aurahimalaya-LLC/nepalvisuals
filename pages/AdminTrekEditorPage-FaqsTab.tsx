import React, { useState } from 'react';
import { Tour, TourService, TourFaq } from '../lib/services/tourService';

interface FaqsTabProps {
    tour: Partial<Tour>;
    onChange: (updates: Partial<Tour>) => void;
    refreshTour: () => void;
}

const FaqsTab: React.FC<FaqsTabProps> = ({ tour, onChange, refreshTour }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddFaq = async () => {
        if (!tour.id || !question.trim() || !answer.trim()) return;

        try {
            await TourService.addFaq({
                tour_id: tour.id,
                question: question.trim(),
                answer: answer.trim()
            });
            setQuestion('');
            setAnswer('');
            setIsAdding(false);
            refreshTour();
        } catch (error) {
            console.error('Failed to add FAQ:', error);
            alert('Failed to add FAQ. Please try again.');
        }
    };

    const handleDeleteFaq = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
        
        try {
            await TourService.deleteFaq(id);
            refreshTour();
        } catch (error) {
            console.error('Failed to delete FAQ:', error);
            alert('Failed to delete FAQ. Please try again.');
        }
    };

    const faqs = tour.faqs || [];

    return (
        <div className="space-y-6">
            <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-admin-text-primary">Frequently Asked Questions</h3>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-3 py-2 bg-admin-primary text-white rounded-lg text-sm font-semibold hover:bg-admin-primary-hover transition-colors"
                    >
                        Add FAQ
                    </button>
                </div>

                {isAdding && (
                    <div className="mb-6 p-4 bg-admin-background rounded-lg border border-admin-border">
                        <h4 className="font-medium mb-3">Add New FAQ</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-admin-text-secondary mb-1">Question</label>
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none"
                                    placeholder="e.g., What is the best time to visit?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-admin-text-secondary mb-1">Answer</label>
                                <textarea
                                    rows={3}
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none"
                                    placeholder="Provide a helpful answer..."
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleAddFaq}
                                    disabled={!question.trim() || !answer.trim()}
                                    className="px-3 py-2 bg-admin-primary text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save FAQ
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setQuestion('');
                                        setAnswer('');
                                    }}
                                    className="px-3 py-2 border border-admin-border rounded-lg text-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {faqs.length === 0 ? (
                    <div className="text-center py-8 text-admin-text-secondary">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">help_outline</span>
                        <p>No FAQs added yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {faqs.map(faq => (
                            <div key={faq.id} className="border border-admin-border rounded-lg p-4 bg-white">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-admin-text-primary mb-2 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-admin-primary text-sm">help</span>
                                            {faq.question}
                                        </h5>
                                        <p className="text-sm text-admin-text-secondary pl-6 border-l-2 border-admin-border/50">
                                            {faq.answer}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteFaq(faq.id)}
                                        className="p-1 text-admin-text-secondary hover:text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaqsTab;
