import React from 'react';
import { HelpCircle } from 'lucide-react';
import { METRIC_DEFINITIONS } from '../data/metricDefinitions';

interface MetricHelpButtonProps {
  metricId: string;
  onOpenHelp: (metricId: string) => void;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  label?: string;
}

export const MetricHelpButton: React.FC<MetricHelpButtonProps> = ({
  metricId,
  onOpenHelp,
  size = 'xs',
  className = '',
  label,
}) => {
  const metric = METRIC_DEFINITIONS[metricId];
  const titleText = metric 
    ? `Help: What ${metric.name} measures, formula & rules of thumb` 
    : 'Help: Click to see what this metric measures & benchmarks';

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  return (
    <button
      type="button"
      id={`btn-help-${metricId}`}
      onClick={(e) => {
        e.stopPropagation();
        onOpenHelp(metricId);
      }}
      title={titleText}
      aria-label={titleText}
      className={`inline-flex items-center justify-center p-0.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 rounded-md transition-colors cursor-pointer group shrink-0 ${className}`}
    >
      <HelpCircle className={`${iconSizes[size]} transition-transform group-hover:scale-110`} />
      {label && <span className="ml-1 text-[10px] font-medium">{label}</span>}
    </button>
  );
};
