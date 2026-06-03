import { IconCircleCheck, IconCircle } from '@tabler/icons-react';
import { Fragment } from 'react';
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

// Half of node width (7rem=112px) minus half of icon (48px) = 32px dead space each side.
// Negative margins extend the connector into that dead space so the line touches the circles.
const NODE_GAP = '32px';

export function Stepper({ steps }: StepperProps) {
  const navigate = useNavigate();
  const paths: Record<number, string> = {
    1: '/plan',
    2: '/tareas',
    3: '/observaciones',
    4: '/hallazgos',
    5: '/',
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
        marginBottom: 'var(--space-8)',
      }}
    >
      <div className="min-w-[700px] max-w-5xl mx-auto px-6">
        <div className="flex items-start">
          {steps.map((step, index) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isFinal = step.id === 5;

            return (
              <Fragment key={step.id}>
                {/* ─── Step node ─── */}
                {/* z-[1] ensures the node (with its bg-card background) renders
                    above the connector when negative margins create an overlap */}
                <div
                  onClick={() => navigate(paths[step.id])}
                  className="flex flex-col items-center flex-shrink-0 cursor-pointer group relative z-[1]"
                  style={{ width: '7rem' }}
                >
                  {/* Icon — scale on hover to signal clickability */}
                  {isCompleted ? (
                    <div className="stepper-check-pop bg-[var(--color-bg-card)] rounded-full w-12 h-12 flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                      <IconCircleCheck size={48} color="var(--color-success)" stroke={1.5} />
                    </div>
                  ) : isCurrent ? (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-[3px] bg-[var(--color-bg-card)] shadow-lg ring-4 transition-transform duration-150 group-hover:scale-110 ${
                        isFinal ? 'animate-pulse-gold ring-amber-500/20' : 'ring-blue-500/20'
                      }`}
                      style={{
                        borderColor: isFinal ? 'var(--color-stepper-final-border)' : 'var(--color-primary)',
                        color: isFinal ? 'var(--color-stepper-final-text)' : 'var(--color-primary)',
                        boxShadow: isFinal
                          ? '0 10px 30px var(--color-stepper-final-glow)'
                          : '0 10px 30px rgba(45, 90, 158, 0.12)',
                      }}
                    >
                      {step.id}
                    </div>
                  ) : (
                    <div className="bg-[var(--color-bg-card)] rounded-full w-12 h-12 flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                      <IconCircle size={48} color="var(--color-text-muted)" stroke={1.5} />
                    </div>
                  )}

                  {/* Label + status dot */}
                  <div className="mt-4 text-center">
                    <p
                      className={`text-sm font-bold transition-colors ${
                        isCurrent
                          ? isFinal
                            ? 'text-[var(--color-stepper-final-text)] font-extrabold'
                            : 'text-[var(--color-primary)]'
                          : isCompleted
                          ? 'text-[var(--color-text)]'
                          : 'text-muted'
                      }`}
                      style={{ transition: 'color var(--transition-fast)' }}
                    >
                      {step.label}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 mt-1.5">
                      <span
                        className={`w-2 h-2 rounded-full transition-colors ${
                          isCompleted
                            ? 'bg-[var(--color-success)]'
                            : isCurrent
                            ? isFinal
                              ? 'bg-[var(--color-stepper-final-border)] animate-pulse'
                              : 'bg-[var(--color-primary)] animate-pulse'
                            : 'bg-[var(--color-border)]'
                        }`}
                        style={{ transition: 'background-color var(--transition-fast)' }}
                      />
                      <span
                        className={`text-xs font-medium transition-colors ${
                          isCompleted
                            ? 'text-[var(--color-success)]'
                            : isCurrent
                            ? isFinal
                              ? 'text-[var(--color-stepper-final-text)] font-semibold'
                              : 'text-[var(--color-primary)]'
                            : 'text-muted'
                        }`}
                        style={{ transition: 'color var(--transition-fast)' }}
                      >
                        {step.statusText ||
                          (isCompleted ? 'Completado' : isCurrent ? 'En progreso' : 'Pendiente')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ─── Connector line between nodes ─── */}
                {/* Negative margins pull the connector into the node's dead space
                    (the gap between the node edge and the circle edge) so it
                    visually touches each circle. The node's z-[1] + bg-card
                    covers the overlap, making the line appear to stop at the circle. */}
                {index < steps.length - 1 && (
                  <div
                    className="flex-1 relative"
                    style={{
                      marginTop: '22px',
                      height: '4px',
                      marginLeft: `-${NODE_GAP}`,
                      marginRight: `-${NODE_GAP}`,
                      flexShrink: 1,
                    }}
                  >
                    {/* Gray track */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'var(--color-border-strong)' }}
                    />
                    {/* Animated green fill — only when the left node is completed */}
                    {isCompleted && (
                      <div
                        className="stepper-segment-fill"
                        style={{ background: 'var(--color-success)' }}
                      />
                    )}
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
