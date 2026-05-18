import { Check } from 'lucide-react';
import React from 'react';

export type StepStatus = 'completed' | 'current' | 'pending';

export interface StepItem {
  id: number;
  label: string;
  status: StepStatus;
  statusText?: string;
}

interface StepperProps {
  steps: StepItem[];
}

export function Stepper({ steps }: StepperProps) {
  return (
    <div className="w-full py-8 mb-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <div className="min-w-[700px] max-w-5xl mx-auto px-6">
        <div className="flex items-start justify-between relative">
          {/* Background connecting line */}
          <div className="absolute left-[5%] top-6 w-[90%] h-[2px] bg-gray-200 -z-10" />
          
          {/* Active progress line calculation */}
          {(() => {
            const currentIndex = steps.findIndex(s => s.status === 'current');
            const fillIndex = currentIndex === -1 
              ? (steps.every(s => s.status === 'completed') ? steps.length - 1 : 0)
              : currentIndex;
              
            const widthPercentage = (fillIndex / (steps.length - 1)) * 100;
            
            return (
              <div 
                className="absolute left-[5%] top-6 h-[2px] bg-[#1E3A5F] -z-10 transition-all duration-500 ease-in-out" 
                style={{ width: `${widthPercentage * 0.9}%` }}
              />
            );
          })()}

          {steps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10 w-32 group">
                {/* Circle */}
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-[3px] transition-all duration-300
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white shadow-md' : 
                      isCurrent ? 'bg-white border-[#1E3A5F] text-[#1E3A5F] shadow-lg ring-4 ring-blue-50' : 
                      'bg-white border-gray-300 text-gray-400 group-hover:border-gray-400'}`}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : step.id}
                </div>
                
                {/* Text and status */}
                <div className="mt-4 text-center">
                  <p className={`text-sm font-bold transition-colors ${
                    isCurrent ? 'text-[#1E3A5F]' : 
                    isCompleted ? 'text-gray-800' : 
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      isCompleted ? 'bg-green-500' : 
                      isCurrent ? 'bg-blue-500 animate-pulse' : 
                      'bg-gray-300'
                    }`} />
                    <span className={`text-xs font-medium ${
                      isCompleted ? 'text-green-600' : 
                      isCurrent ? 'text-blue-600' : 
                      'text-gray-400'
                    }`}>
                      {step.statusText || (isCompleted ? 'Completado' : isCurrent ? 'En progreso' : 'Pendiente')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
