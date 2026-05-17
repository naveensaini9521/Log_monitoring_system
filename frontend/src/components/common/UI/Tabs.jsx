// src/components/common/UI/Tabs.jsx
import React, { useState } from 'react';

const Tabs = ({ 
  tabs = [], 
  defaultActive = 0,
  variant = 'default',
  className = '',
  onChange,
  ...props 
}) => {
  const [activeTab, setActiveTab] = useState(defaultActive);

  const variants = {
    default: {
      tab: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
      active: 'border-blue-500 text-blue-600',
      container: 'border-b border-gray-200'
    },
    pills: {
      tab: 'rounded-lg text-gray-600 hover:bg-gray-100',
      active: 'bg-blue-100 text-blue-600',
      container: 'space-x-2'
    },
    underline: {
      tab: 'text-gray-500 hover:text-gray-700',
      active: 'text-blue-600 border-b-2 border-blue-600',
      container: 'border-b border-gray-200'
    }
  };

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onChange) onChange(index);
  };

  return (
    <div className={className} {...props}>
      {/* Tab Headers */}
      <div className={`flex ${variants[variant].container}`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`
              px-4 py-3 text-sm font-medium whitespace-nowrap
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${index === activeTab ? variants[variant].active : variants[variant].tab}
              ${variant === 'pills' ? 'px-4 py-2 rounded-lg' : 'border-b-2'}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !tab.disabled && handleTabClick(index)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {tab.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {tabs[activeTab]?.content && (
          <div key={activeTab} className="animate-fadeIn">
            {tabs[activeTab].content}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabs;