import { useState } from 'react';
import { Card } from '../components/Card';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  IconTypography,
  IconPalette,
  IconMoodHappy,
  IconClick,
  IconInfoCircle,
  IconLayoutDashboard,
  IconClipboardList,
  IconListCheck,
  IconEye,
  IconChartBar,
  IconPencil,
  IconDeviceFloppy,
  IconPlus,
  IconTrash,
  IconX,
  IconCircleCheck,
  IconAlertTriangle,
  IconBell
} from '@tabler/icons-react';

export function GuiaDiseno() {
  const [activeTab, setActiveTab] = useState<'typography' | 'colors' | 'icons' | 'states' | 'principles'>('typography');

  const tabs = [
    { id: 'typography', label: 'Tipografía', icon: IconTypography },
    { id: 'colors', label: 'Colores', icon: IconPalette },
    { id: 'icons', label: 'Iconografía', icon: IconMoodHappy },
    { id: 'states', label: 'Estados', icon: IconClick },
    { id: 'principles', label: 'Principios', icon: IconInfoCircle },
  ] as const;

  return (
    <div className="animate-fade-in">
      <Breadcrumbs items={[
        { label: 'Proyectos' },
        { label: 'Documentación' },
        { label: 'Guía de diseño' }
      ]} />

      <header className="mb-8">
        <h1 className="page-title">Guía de Estilos — DesignLab</h1>
        <p className="text-base text-[var(--color-text-secondary)] mt-1">
          Documentación técnica del sistema visual y principios de diseño aplicados en la plataforma.
        </p>
      </header>

      {/* Tabs navigation */}
      <div className="flex border-b border-[var(--color-border)] mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-t-lg'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] rounded-t-lg'
              }`}
              style={{ transition: 'all var(--transition-fast)' }}
              aria-selected={isActive}
              role="tab"
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab contents */}
      <div className="tab-content">
        {activeTab === 'typography' && (
          <div className="space-y-6">
            <Card title="Escala Tipográfica">
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Utilizamos dos familias tipográficas: <strong className="text-[var(--color-text)]">Syne</strong> para encabezados de alto impacto y <strong className="text-[var(--color-text)]">DM Sans</strong> para bloques de texto e interacción general.
              </p>
              
              <div className="overflow-x-auto">
                <table className="design-table w-full" aria-describedby="typo-caption">
                  <caption id="typo-caption" className="sr-only">Tabla de escala tipográfica</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="w-1/2">Ejemplo Visual</th>
                      <th scope="col" className="w-1/2">Especificación Técnica</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="align-middle">
                        <span style={{ fontFamily: 'var(--font-title)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-black)', lineHeight: 1.1 }} className="text-[var(--color-text)]">
                          Título Principal 3XL
                        </span>
                      </td>
                      <td className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        <strong>Token:</strong> <code>--text-3xl</code> (42px) <br />
                        <strong>Familia:</strong> Syne (sans-serif) <br />
                        <strong>Peso:</strong> Black (800) <br />
                        <strong>Uso:</strong> Hero / Título de Landing
                      </td>
                    </tr>
                    <tr>
                      <td className="align-middle">
                        <span style={{ fontFamily: 'var(--font-title)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-black)' }} className="text-[var(--color-text)]">
                          Encabezado 2XL
                        </span>
                      </td>
                      <td className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        <strong>Token:</strong> <code>--text-2xl</code> (32px) <br />
                        <strong>Familia:</strong> Syne (sans-serif) <br />
                        <strong>Peso:</strong> Black (800) <br />
                        <strong>Uso:</strong> Títulos de módulo principal
                      </td>
                    </tr>
                    <tr>
                      <td className="align-middle">
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)' }} className="text-[var(--color-text)]">
                          Subtítulo XL
                        </span>
                      </td>
                      <td className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        <strong>Token:</strong> <code>--text-xl</code> (24px) <br />
                        <strong>Familia:</strong> DM Sans (sans-serif) <br />
                        <strong>Peso:</strong> Bold (700) <br />
                        <strong>Uso:</strong> Título secundario de dashboard y cards
                      </td>
                    </tr>
                    <tr>
                      <td className="align-middle">
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)' }} className="text-[var(--color-text)]">
                          Texto Destacado LG
                        </span>
                      </td>
                      <td className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        <strong>Token:</strong> <code>--text-lg</code> (20px) <br />
                        <strong>Familia:</strong> DM Sans (sans-serif) <br />
                        <strong>Peso:</strong> Medium (500) <br />
                        <strong>Uso:</strong> Subtítulos de sección y llamados importantes
                      </td>
                    </tr>
                    <tr>
                      <td className="align-middle">
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-regular)' }} className="text-[var(--color-text)]">
                          Cuerpo de Texto Base
                        </span>
                      </td>
                      <td className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        <strong>Token:</strong> <code>--text-base</code> (15px) <br />
                        <strong>Familia:</strong> DM Sans (sans-serif) <br />
                        <strong>Peso:</strong> Regular (400) <br />
                        <strong>Uso:</strong> Texto descriptivo, inputs de formularios, tablas
                      </td>
                    </tr>
                    <tr>
                      <td className="align-middle">
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }} className="text-[var(--color-text)]">
                          Etiqueta Pequeña SM
                        </span>
                      </td>
                      <td className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        <strong>Token:</strong> <code>--text-sm</code> (13px) <br />
                        <strong>Familia:</strong> DM Sans (sans-serif) <br />
                        <strong>Peso:</strong> Medium (500) <br />
                        <strong>Uso:</strong> Breadcrumbs, badges, tooltips
                      </td>
                    </tr>
                    <tr>
                      <td className="align-middle">
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }} className="text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] px-1 rounded">
                          Código Mono XS
                        </span>
                      </td>
                      <td className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        <strong>Token:</strong> <code>--text-xs</code> (11px) <br />
                        <strong>Familia:</strong> Roboto Mono (monospace) <br />
                        <strong>Peso:</strong> Regular (400) <br />
                        <strong>Uso:</strong> Valores técnicos, variables CSS
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-8">
            <Card title="Paleta de Colores y Ratios de Contraste">
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Todas las combinaciones principales se estructuran utilizando variables CSS. Se documentan aquí los ratios de contraste WCAG AA verificados.
              </p>

              {/* Categoría: Primarios */}
              <div className="mb-6">
                <h3 className="text-md font-bold mb-3 text-[var(--color-text)] border-b pb-1">Colores del Core y Primarios</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ColorChip
                    name="color-sidebar"
                    value="#1e3a5f"
                    description="Fondo de la barra lateral (Dark Navy Blue)"
                    ratios={{ white: '11.4:1', black: '1.8:1' }}
                  />
                  <ColorChip
                    name="color-primary"
                    value="#2d5a9e"
                    description="Identidad de botones y estados activos"
                    ratios={{ white: '5.3:1', black: '4.0:1' }}
                  />
                  <ColorChip
                    name="color-primary-light"
                    value="#e8f0fb"
                    description="Contenedores e inputs activos (Claro)"
                    ratios={{ white: '1.2:1', black: '17.8:1' }}
                  />
                </div>
              </div>

              {/* Categoría: Semánticos */}
              <div className="mb-6">
                <h3 className="text-md font-bold mb-3 text-[var(--color-text)] border-b pb-1">Colores Semánticos (Estado y Severidad)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ColorChip
                    name="color-success"
                    value="#22C55E"
                    description="Estado completado (Bajo error/Éxito)"
                    ratios={{ white: '2.0:1', black: '10.4:1' }}
                  />
                  <ColorChip
                    name="color-warning"
                    value="#F59E0B"
                    description="Severidad Media / Advertencia"
                    ratios={{ white: '2.3:1', black: '9.2:1' }}
                  />
                  <ColorChip
                    name="color-error"
                    value="#EF4444"
                    description="Severidad Alta / Peligro / Error"
                    ratios={{ white: '4.0:1', black: '5.3:1' }}
                  />
                </div>
              </div>

              {/* Categoría: Badges WCAG AA */}
              <div className="mb-6">
                <h3 className="text-md font-bold mb-3 text-[var(--color-text)] border-b pb-1">Tokens Especiales para Badges (WCAG AA)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ColorChip
                    name="color-badge-alta-text"
                    value="#991B1B"
                    description="Texto badge Alta (Claro)"
                    ratios={{ white: '5.2:1 (sobre #FEE2E2)' }}
                    isCustomRatio
                  />
                  <ColorChip
                    name="color-badge-media-text"
                    value="#92400E"
                    description="Texto badge Media (Claro)"
                    ratios={{ white: '6.4:1 (sobre #FEF3C7)' }}
                    isCustomRatio
                  />
                  <ColorChip
                    name="color-badge-baja-text"
                    value="#166534"
                    description="Texto badge Baja (Claro)"
                    ratios={{ white: '7.4:1 (sobre #DCFCE7)' }}
                    isCustomRatio
                  />
                </div>
              </div>

              {/* Categoría: Neutros */}
              <div>
                <h3 className="text-md font-bold mb-3 text-[var(--color-text)] border-b pb-1">Colores Neutros y Estructurales</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ColorChip
                    name="color-bg"
                    value="#F8FAFC"
                    description="Fondo de la aplicación (Modo Claro)"
                    ratios={{ white: '1.0:1', black: '20.0:1' }}
                  />
                  <ColorChip
                    name="color-bg-card"
                    value="#FFFFFF"
                    description="Fondo de tarjetas e inputs (Modo Claro)"
                    ratios={{ white: '1.0:1', black: '21.0:1' }}
                  />
                  <ColorChip
                    name="color-text"
                    value="#0F172A"
                    description="Texto principal (Slate 900)"
                    ratios={{ white: '18.2:1', black: '1.1:1' }}
                  />
                  <ColorChip
                    name="color-text-secondary"
                    value="#475569"
                    description="Texto secundario (Slate 600)"
                    ratios={{ white: '5.9:1', black: '3.5:1' }}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'icons' && (
          <div className="space-y-6">
            <Card title="Sistema de Iconografía">
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Todos los íconos de la aplicación provienen del set de <strong className="text-[var(--color-text)]">Tabler Icons</strong>, usando un estilo outline homogéneo para mantener la consistencia visual.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <IconSample icon={IconLayoutDashboard} name="IconLayoutDashboard" usage="Dashboard y métricas globales" />
                <IconSample icon={IconClipboardList} name="IconClipboardList" usage="Fase 1: Configurar plan de prueba" />
                <IconSample icon={IconListCheck} name="IconListCheck" usage="Fase 2: Definición de tareas y guion" />
                <IconSample icon={IconEye} name="IconEye" usage="Fase 3: Registro de observaciones" />
                <IconSample icon={IconChartBar} name="IconChartBar" usage="Fase 4: Síntesis de hallazgos" />
                <IconSample icon={IconPencil} name="IconPencil" usage="Botón para activar modo de edición" />
                <IconSample icon={IconDeviceFloppy} name="IconDeviceFloppy" usage="Botón de guardar cambios" />
                <IconSample icon={IconPlus} name="IconPlus" usage="Botón de añadir registro en tablas" />
                <IconSample icon={IconTrash} name="IconTrash" usage="Eliminación de registros" />
                <IconSample icon={IconX} name="IconX" usage="Cancelar edición y descartar cambios" />
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'states' && (
          <div className="space-y-8">
            <Card title="Estados del Botón Primario">
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Garantiza que cada estado visual comunique una retroalimentación clara del sistema al interactuar.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div className="text-center p-4 border rounded-lg bg-[var(--color-bg)]">
                  <span className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-3">Default</span>
                  <button className="btn-primary">Botón Primario</button>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-3">Estado inicial inactivo del botón.</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg bg-[var(--color-bg)]">
                  <span className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-3">Hover</span>
                  <button className="btn-primary" style={{ backgroundColor: 'var(--color-btn-primary-hover)' }}>Botón Primario</button>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-3">Cursor posicionado sobre el botón.</p>
                </div>

                <div className="text-center p-4 border rounded-lg bg-[var(--color-bg)]">
                  <span className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-3">Activo / Click</span>
                  <button className="btn-primary" style={{ transform: 'scale(0.98)', filter: 'brightness(0.9)' }}>Botón Primario</button>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-3">Efecto visual al mantener presionado.</p>
                </div>

                <div className="text-center p-4 border rounded-lg bg-[var(--color-bg)]">
                  <span className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-3">Desactivado</span>
                  <button className="btn-primary opacity-50 cursor-not-allowed" disabled>Botón Primario</button>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-3">Acción bloqueada (ej. sin proyecto activo).</p>
                </div>
              </div>
            </Card>

            <Card title="Estados del Botón Editar">
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                El botón de acción secundario que permite habilitar el modo de edición en los diferentes módulos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="text-center p-4 border rounded-lg bg-[var(--color-bg)]">
                  <span className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-3">Default (Estado inicial)</span>
                  <button className="btn-editar" type="button">
                    <IconPencil size={16} />
                    Editar
                  </button>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-3">Diseño limpio de contorno para acción secundaria.</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg bg-[var(--color-bg)]">
                  <span className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-3">Hover</span>
                  <button className="btn-editar" type="button" style={{ backgroundColor: 'var(--color-btn-outline-hover-bg)', borderColor: 'var(--color-btn-outline-text)' }}>
                    <IconPencil size={16} />
                    Editar
                  </button>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-3">Retroalimentación con color de fondo primario suave.</p>
                </div>

                <div className="text-center p-4 border rounded-lg bg-[var(--color-bg)]">
                  <span className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-3">Desactivado / Disabled</span>
                  <button className="btn-editar" type="button" disabled>
                    <IconPencil size={16} />
                    Editar
                  </button>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-3">Cursor bloqueado y opacidad reducida.</p>
                </div>
              </div>
            </Card>

            <Card title="Estados de Inputs de Formulario">
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Los formularios aplican los estilos en base al foco, llenado y retroalimentación de error.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 border rounded-lg bg-[var(--color-bg)]">
                  <span className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-2">Default</span>
                  <input className="form-input w-full px-3 py-2" placeholder="Escribe aquí..." />
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2">Borde neutro esperando interactuar.</p>
                </div>

                <div className="p-4 border rounded-lg bg-[var(--color-bg)]">
                  <span className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-2">Focus (Enfoque)</span>
                  <input className="form-input w-full px-3 py-2 border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]" placeholder="Foco activado..." autoFocus={false} style={{ outline: 'none' }} />
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2">Borde primario y sombreado de destaque.</p>
                </div>

                <div className="p-4 border rounded-lg bg-[var(--color-bg)] text-relative">
                  <span className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-2">Filled (Llenado)</span>
                  <div className="relative">
                    <input className="form-input w-full px-3 py-2 is-filled" value="Texto guardado" readOnly />
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2">Indica que el campo ya tiene información válida.</p>
                </div>

                <div className="p-4 border rounded-lg bg-[var(--color-bg)]">
                  <span className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-2">Error / Validación</span>
                  <input className="form-input w-full px-3 py-2 border-red-500 bg-red-50 text-red-900" value="Valor inválido" readOnly />
                  <p className="text-xs text-red-600 mt-2 font-medium">Borde rojo y texto de soporte.</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'principles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PrincipleCard
              number="1"
              title="Tipografía y Jerarquía"
              description="Se definió una escala estructurada clara diferenciando encabezados ('Syne' para títulos impactantes y contundentes) de textos de lectura ('DM Sans' para formularios y descripciones) optimizando la legibilidad general."
            />
            <PrincipleCard
              number="2"
              title="Color con Sentido Semántico"
              description="Los colores no son ornamentales; se utilizan de forma semántica en badges de severidad (Alta en rojo oscuro, Media en ámbar y Baja en verde) asegurando el cumplimiento estricto del contraste WCAG AA."
            />
            <PrincipleCard
              number="3"
              title="Iconografía Consistente"
              description="Uso exclusivo del set de Tabler Icons en estilo outline con un grosor uniforme. Esto evita la contaminación visual y garantiza una asimilación rápida de la función por parte del usuario."
            />
            <PrincipleCard
              number="4"
              title="Estados del Sistema"
              description="Cada botón o control de formulario reacciona inmediatamente al foco, hover, clicks o desactivaciones, además de proveer confirmaciones visuales instantáneas como checkmarks en validación exitosa."
            />
            <PrincipleCard
              number="5"
              title="Consistencia Estructural"
              description="Todos los módulos de la aplicación comparten la misma barra de estados (Stepper), breadcrumbs superiores y contenedor de cards de información, facilitando el aprendizaje del sistema."
            />
            <PrincipleCard
              number="6"
              title="Interacción y Microanimaciones"
              description="Las transiciones de opacidad y las animaciones de pulso en el paso final del Stepper dirigen la atención visual del usuario de forma amigable y reducen la carga cognitiva durante el flujo."
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* Sub-component: Color chip display */
function ColorChip({
  name,
  value,
  description,
  ratios,
  isCustomRatio = false
}: {
  name: string;
  value: string;
  description: string;
  ratios: { white?: string; black?: string };
  isCustomRatio?: boolean;
}) {
  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-bg-card)] shadow-sm hover:shadow transition-shadow">
      <div className="h-16 flex items-center justify-end px-3 font-mono text-xs font-bold text-white shadow-inner" style={{ backgroundColor: value, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
        {value}
      </div>
      <div className="p-3">
        <h4 className="font-mono text-xs font-bold text-[var(--color-text)]">--{name}</h4>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1 mb-2">{description}</p>
        <div className="flex gap-2 text-[10px] font-bold">
          {isCustomRatio ? (
            <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded dark:bg-green-900/30 dark:text-green-300">
              Contraste: {ratios.white}
            </span>
          ) : (
            <>
              <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded dark:bg-blue-900/20 dark:text-blue-300">
                vs Blanco: {ratios.white}
              </span>
              <span className="bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded dark:bg-purple-900/20 dark:text-purple-300">
                vs Negro: {ratios.black}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* Sub-component: Icon sample display */
function IconSample({ icon: Icon, name, usage }: { icon: any; name: string; usage: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-center hover:bg-[var(--color-bg-secondary)] transition-colors">
      <Icon size={28} className="text-[var(--color-primary)] mb-2" />
      <span className="font-mono text-[10px] font-bold text-[var(--color-text)] block truncate w-full">{name}</span>
      <span className="text-[11px] text-[var(--color-text-secondary)] mt-1 line-clamp-2 leading-tight">{usage}</span>
    </div>
  );
}

/* Sub-component: Principle explanation card */
function PrincipleCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 p-5 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-card)] shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-black flex items-center justify-center flex-shrink-0 text-lg">
        {number}
      </div>
      <div>
        <h3 className="font-bold text-base text-[var(--color-text)] mb-1.5">{title}</h3>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
