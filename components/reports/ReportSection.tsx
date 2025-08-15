
import React from 'react';

interface ReportSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ReportSection: React.FC<ReportSectionProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className || ''}`}>
      <h3 className="text-xl font-semibold text-dark-text mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default ReportSection;
