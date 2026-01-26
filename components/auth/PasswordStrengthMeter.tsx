import React from 'react';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthMeterProps {
    password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
    const result = zxcvbn(password || '');
    const score = result.score; // 0-4

    const getLabel = () => {
        switch (score) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            default: return '';
        }
    };

    const getColor = () => {
        switch (score) {
            case 0: return 'bg-red-500';
            case 1: return 'bg-red-400';
            case 2: return 'bg-yellow-500';
            case 3: return 'bg-blue-500';
            case 4: return 'bg-green-500';
            default: return 'bg-gray-200';
        }
    };

    return (
        <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Password Strength:</span>
                <span className={`font-medium ${
                    score <= 1 ? 'text-red-500' : 
                    score === 2 ? 'text-yellow-600' : 
                    score === 3 ? 'text-blue-600' : 'text-green-600'
                }`}>
                    {password ? getLabel() : 'None'}
                </span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
                {[0, 1, 2, 3].map((level) => (
                    <div 
                        key={level}
                        className={`flex-1 transition-colors duration-300 ${
                            score > level ? getColor() : 'bg-transparent'
                        }`}
                    />
                ))}
            </div>
            {result.feedback.warning && (
                <p className="text-xs text-red-500 mt-1">{result.feedback.warning}</p>
            )}
        </div>
    );
};

export default PasswordStrengthMeter;
