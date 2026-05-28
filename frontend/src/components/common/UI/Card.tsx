import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300';
  
  const classes = `${baseClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;