import React from 'react';

export interface MinimalListItem {
  id: string;
  title: string;
}

interface MinimalListProps {
  items: MinimalListItem[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

const MinimalList: React.FC<MinimalListProps> = ({
  items,
  selectedId,
  onSelect,
  className = '',
}) => {
  return (
    <ul className={`divide-y divide-gray-100 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden ${className}`}>
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        return (
          <li key={item.id}>
            <button
              onClick={() => onSelect(item.id)}
              className={`w-full text-left px-5 py-4 transition-all duration-200 ease-in-out
                ${isSelected 
                  ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-l-blue-500 pl-4' 
                  : 'text-gray-700 hover:bg-gray-50 hover:pl-6 border-l-4 border-l-transparent'
                }
                focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
              `}
              aria-selected={isSelected}
              role="option"
            >
              <span className="truncate block text-sm sm:text-base">
                {item.title}
              </span>
            </button>
          </li>
        );
      })}
      {items.length === 0 && (
        <li className="px-5 py-8 text-center text-gray-400 text-sm">
          No items found
        </li>
      )}
    </ul>
  );
};

export default MinimalList;
