import React from 'react';

interface CornerBracketsProps {
  children?: React.ReactNode;
  active?: boolean;
}

export const CornerBrackets: React.FC<CornerBracketsProps> = ({ children, active = true }) => {
  return <>{children}</>;
};

