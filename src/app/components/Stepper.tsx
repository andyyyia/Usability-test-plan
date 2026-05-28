import { IconCircleCheck, IconCircle } from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router';

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
  const navigate = useNavigate();
  const paths: Record<number, string> = {
    1: '/plan',
    2: '/tareas',
    3: '/observaciones',
    4: '/hallazgos',
    5: '/'
  };

  return (
    <div 
      className="w-full overflow-x-auto" 
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--space-8)'
      }}
    >
      <div className="min-w-[700px] max-w-5xl mx-auto px-6">
        <div className="flex items-start justify-between relative">
          {/* Background connecting line */}
          <div className="absolute left-[5%] top-6 w-[90%] h-[2px] bg-[var(--color-border-strong)] -z-10" />
          
          {/* Active progress line calculation */}
          {(() => {
            const currentIndex = steps.findIndex(s => s.status === 'current');
            const fillIndex = currentIndex === -1 
              ? (steps.every(s => s.status === 'completed') ? steps.length - 1 : 0)
              : currentIndex;
              
            const widthPercentage = (fillIndex / (steps.length - 1)) * 100;
            const isFinalActive = currentIndex === 4;
            
            return (
              <div 
                className="absolute left-[5%] top-6 h-[2px] -z-10 transition-all duration-500 ease-in-out" 
                style={{ 
                  width: `${widthPercentage * 0.9}%`,
                  background: isFinalActive 
                    ? 'linear-gradient(to right, var(--color-primary), var(--color-stepper-final-border))' 
                    : 'var(--color-primary)' 
                }}
              />
            );
          })()}

          {steps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            
            return (
              <div 
                key={step.id} 
                onClick={() => navigate(paths[step.id])}
                className="flex flex-col items-center relative z-10 w-32 group cursor-pointer"
              >
                {/* Completed tooltip */}
                {isCompleted && (
                  <div 
                    className="absolute bottom-[52px] invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-[var(--color-text)] text-white text-xs rounded py-1.5 px-3 whitespace-nowrap z-50 pointer-events-none shadow-md"
                    style={{ 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      transition: 'opacity 150ms ease, visibility 150ms ease'
                    }}
                  >
                    {step.label}
                    {/* Arrow */}
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 -mt-1"
                      style={{ borderColor: 'transparent transparent var(--color-text) transparent', borderStyle: 'solid', borderWidth: '0 0.4rem 0.4rem 0.4rem' }}
                    />
                  </div>
                )}

                {isCompleted ? (
                  <div 
                    className="bg-[var(--color-bg-card)] rounded-full flex items-center justify-center relative z-10 w-12 h-12 transition-all"
                    style={{ transition: 'all var(--transition-fast)' }}
                  >
                    <IconCircleCheck size={48} color="var(--color-success)" stroke={1.5} />
                  </div>
                ) : isCurrent ? (
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-[3px] transition-all bg-[var(--color-bg-card)] shadow-lg ring-4 relative z-10 ${step.id === 5 ? 'animate-pulse-gold ring-amber-500/20' : 'ring-blue-500/20'}`}
                    style={{ 
                      borderColor: step.id === 5 ? 'var(--color-stepper-final-border)' : 'var(--color-primary)', 
                      color: step.id === 5 ? 'var(--color-stepper-final-text)' : 'var(--color-primary)',
                      boxShadow: step.id === 5 
                        ? '0 10px 30px var(--color-stepper-final-glow)' 
                        : '0 10px 30px rgba(45, 90, 158, 0.12)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {step.id}
                  </div>
                ) : (
                  <div 
                    className="bg-[var(--color-bg-card)] rounded-full flex items-center justify-center relative z-10 w-12 h-12 transition-all"
                    style={{ transition: 'all var(--transition-fast)' }}
                  >
                    <IconCircle size={48} color="var(--color-text-muted)" stroke={1.5} />
                  </div>
                )}
                
                {/* Text and status */}
                <div className="mt-4 text-center">
                  <p 
                    className={`text-sm font-bold transition-colors ${
                      isCurrent 
                        ? (step.id === 5 ? 'text-[var(--color-stepper-final-text)] font-extrabold' : 'text-[var(--color-primary)]') 
                        : isCompleted ? 'text-[var(--color-text)]' : 
                      'text-muted'
                    }`}
                    style={{ transition: 'color var(--transition-fast)' }}
                  >
                    {step.label}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    <span 
                      className={`w-2 h-2 rounded-full transition-colors ${
                        isCompleted ? 'bg-[var(--color-success)]' : 
                        isCurrent 
                          ? (step.id === 5 ? 'bg-[var(--color-stepper-final-border)] animate-pulse' : 'bg-[var(--color-primary)] animate-pulse') 
                          : 'bg-[var(--color-border)]'
                      }`}
                      style={{ transition: 'background-color var(--transition-fast)' }}
                    />
                    <span 
                      className={`text-xs font-medium transition-colors ${
                        isCompleted ? 'text-[var(--color-success)]' : 
                        isCurrent 
                          ? (step.id === 5 ? 'text-[var(--color-stepper-final-text)] font-semibold' : 'text-[var(--color-primary)]') 
                          : 'text-muted'
                      }`}
                      style={{ transition: 'color var(--transition-fast)' }}
                    >
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
