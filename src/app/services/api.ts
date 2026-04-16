import { supabase } from '../../lib/supabase';

// Helper function to handle Supabase responses
const handleResponse = ({ data, error }: any) => {
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  return data;
};

export const api = {
  // Proyectos
  getProyectos: async () => {
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .order('fecha_creacion', { ascending: false });
    return handleResponse({ data, error });
  },
  createProyecto: async (nombre: string, descripcion: string) => {
    const { data, error } = await supabase
      .from('proyectos')
      .insert([{ nombre, descripcion }])
      .select();
    return handleResponse({ data: data?.[0], error });
  },
  updateProyecto: async (id: number, nombre: string, descripcion: string) => {
    const { data, error } = await supabase
      .from('proyectos')
      .update({ nombre, descripcion })
      .eq('id', id)
      .select();
    return handleResponse({ data: data?.[0], error });
  },
  deleteProyecto: async (id: number) => {
    // Borrado preventivo en cascada manual de todas las entidades dependientes
    await supabase.from('planes_prueba').delete().eq('proyecto_id', id);
    await supabase.from('tareas_plan').delete().eq('proyecto_id', id);
    await supabase.from('tareas_guion').delete().eq('proyecto_id', id);
    await supabase.from('observaciones').delete().eq('proyecto_id', id);
    await supabase.from('hallazgos').delete().eq('proyecto_id', id);
    
    // Eliminación del proyecto matriz
    const { error } = await supabase.from('proyectos').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Planes de Prueba
  getPlan: async (proyectoId: number) => {
    const { data, error } = await supabase
      .from('planes_prueba')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .single();
    
    // PGRST116 means zero rows found, which is expected if plan doesn't exist yet
    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    return data || null;
  },
  savePlan: async (planData: any) => {
    // Check if it exists for this project
    const { data: existing } = await supabase
      .from('planes_prueba')
      .select('id')
      .eq('proyecto_id', planData.proyecto_id)
      .limit(1)
      .maybeSingle();
    
    let res;
    if (existing) {
      res = await supabase
        .from('planes_prueba')
        .update(planData)
        .eq('id', existing.id)
        .select();
    } else {
      res = await supabase
        .from('planes_prueba')
        .insert([planData])
        .select();
    }
    return handleResponse({ data: res.data?.[0], error: res.error });
  },

  // Tareas
  getTareasPlan: async (proyectoId: number) => {
    const { data, error } = await supabase
      .from('tareas_plan')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .order('id', { ascending: true });
    return handleResponse({ data, error });
  },
  saveTareasPlan: async (proyectoId: number, tareas: any[]) => {
    // Reemplazo total simple para mantener comportamiento anterior
    await supabase.from('tareas_plan').delete().eq('proyecto_id', proyectoId);
    if (tareas.length === 0) return { message: 'Operación exitosa' };
    
    const { data, error } = await supabase
      .from('tareas_plan')
      .insert(tareas.map(t => ({ ...t, proyecto_id: proyectoId })));
    return handleResponse({ data, error });
  },
  
  getTareasGuion: async (proyectoId: number) => {
    const { data, error } = await supabase
      .from('tareas_guion')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .order('id', { ascending: true });
    return handleResponse({ data, error });
  },
  saveTareasGuion: async (proyectoId: number, tareas: any[]) => {
    await supabase.from('tareas_guion').delete().eq('proyecto_id', proyectoId);
    if (tareas.length === 0) return { message: 'Operación exitosa' };
    
    const { data, error } = await supabase
      .from('tareas_guion')
      .insert(tareas.map(t => ({ ...t, proyecto_id: proyectoId })));
    return handleResponse({ data, error });
  },

  // Observaciones
  getObservaciones: async (proyectoId: number) => {
    const { data, error } = await supabase
      .from('observaciones')
      .select('*')
      .eq('proyecto_id', proyectoId);
    if (error) throw new Error(error.message);
    
    // Frontend expects 'tarea' instead of 'tarea_id' based on previous backend alias
    return data.map((d: any) => ({ ...d, tarea: d.tarea_id }));
  },
  saveObservaciones: async (proyectoId: number, observaciones: any[]) => {
    await supabase.from('observaciones').delete().eq('proyecto_id', proyectoId);
    if (observaciones.length === 0) return { message: 'Operación exitosa' };
    
    const mapped = observaciones.map((o: any) => ({
      proyecto_id: proyectoId,
      participante: o.participante,
      perfil: o.perfil,
      tarea_id: o.tarea, // Mapping front 'tarea' to DB 'tarea_id'
      exito: o.exito,
      tiempo: o.tiempo,
      errores: o.errores,
      comentarios: o.comentarios,
      problema: o.problema,
      severidad: o.severidad,
      mejora: o.mejora
    }));
    const { data, error } = await supabase.from('observaciones').insert(mapped);
    return handleResponse({ data, error });
  },

  // Hallazgos
  getHallazgos: async (proyectoId: number) => {
    const { data, error } = await supabase
      .from('hallazgos')
      .select('*')
      .eq('proyecto_id', proyectoId);
    return handleResponse({ data, error });
  },
  saveHallazgos: async (proyectoId: number, hallazgos: any[]) => {
    await supabase.from('hallazgos').delete().eq('proyecto_id', proyectoId);
    if (hallazgos.length === 0) return { message: 'Operación exitosa' };
    
    const { data, error } = await supabase
      .from('hallazgos')
      .insert(hallazgos.map(h => ({ ...h, proyecto_id: proyectoId })));
    return handleResponse({ data, error });
  },
};
