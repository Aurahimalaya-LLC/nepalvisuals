import React, { useState, useRef, useEffect } from 'react';

interface FocusKeywordsInputProps {
  value: string;
  onChange: (value: string) => void;
  existingKeywords?: string[];
  maxLength?: number;
  placeholder?: string;
}

/**
 * Focus Keywords Input Component
 * 
 * A tag-based input for focus keywords with auto-suggest functionality.
 * Supports comma-separated values with a character limit.
 */
export const FocusKeywordsInput: React.FC<FocusKeywordsInputProps> = ({
  value,
  onChange,
  existingKeywords = [],
  maxLength = 255,
  placeholder = "Enter focus keywords, separated by commas..."
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Parse current keywords
  const currentKeywords = value ? value.split(',').map(k => k.trim()).filter(k => k) : [];

  // Get suggestions based on input
  const getSuggestions = (input: string) => {
    if (!input || input.length < 2) return [];
    
    const lowerInput = input.toLowerCase();
    return existingKeywords
      .filter(keyword => 
        keyword.toLowerCase().includes(lowerInput) &&
        !currentKeywords.some(k => k.toLowerCase() === keyword.toLowerCase())
      )
      .slice(0, 5);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.includes(',')) {
      // Add keywords when comma is typed
      const parts = newValue.split(',');
      const newKeyword = parts[0].trim();
      
      if (newKeyword && !currentKeywords.includes(newKeyword)) {
        const remainingLength = maxLength - value.length;
        if (newKeyword.length <= remainingLength) {
          const updatedKeywords = [...currentKeywords, newKeyword];
          onChange(updatedKeywords.join(', '));
        }
      }
      
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      // Show suggestions
      const newSuggestions = getSuggestions(newValue);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    const updatedKeywords = [...currentKeywords, suggestion];
    onChange(updatedKeywords.join(', '));
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Remove keyword
  const removeKeyword = (keywordToRemove: string) => {
    const updatedKeywords = currentKeywords.filter(k => k !== keywordToRemove);
    onChange(updatedKeywords.join(', '));
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim() && !currentKeywords.includes(inputValue.trim())) {
        const remainingLength = maxLength - value.length;
        if (inputValue.trim().length <= remainingLength) {
          const updatedKeywords = [...currentKeywords, inputValue.trim()];
          onChange(updatedKeywords.join(', '));
          setInputValue('');
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    } else if (e.key === 'Backspace' && !inputValue && currentKeywords.length > 0) {
      // Remove last keyword on backspace when input is empty
      const updatedKeywords = currentKeywords.slice(0, -1);
      onChange(updatedKeywords.join(', '));
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const remainingChars = maxLength - value.length;

  return (
    <div className="relative">
      <div className="border border-admin-border rounded-lg p-2 min-h-[44px] flex flex-wrap items-center gap-2">
        {currentKeywords.map((keyword, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-admin-primary/10 text-admin-primary rounded-md text-sm"
          >
            {keyword}
            <button
              type="button"
              onClick={() => removeKeyword(keyword)}
              className="text-admin-primary hover:text-admin-primary-hover"
              aria-label={`Remove ${keyword}`}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={currentKeywords.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-none outline-none text-sm bg-transparent"
          maxLength={maxLength}
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-admin-surface border border-admin-border rounded-lg shadow-lg z-10"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-admin-background transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-1">
        <p className="text-xs text-admin-text-secondary">
          Separate keywords with commas or press Enter
        </p>
        <p className={`text-xs ${remainingChars < 20 ? 'text-red-500' : 'text-admin-text-secondary'}`}>
          {remainingChars} characters remaining
        </p>
      </div>
    </div>
  );
};

export default FocusKeywordsInput;