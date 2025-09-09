

import React from 'react';

// FIX: Extend React.HTMLAttributes<HTMLDivElement> to allow passing standard div props like draggable and onDragStart.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white shadow-sm rounded-lg overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
};