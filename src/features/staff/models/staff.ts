// src/features/staff/models/staff.ts

export interface Staff {
  id?: number
  firstname: string // ✅ CAMBIO: era first_name
  lastname: string // ✅ CAMBIO: era last_name
  email?: string
  phone?: string
  cellphone?: string
  dni?: string
  address?: string
  position_id: number
  active?: boolean // ✅ CAMBIO: era is_active
  created_at?: string
  updated_at?: string

  position?: {
    id: number
    name: string
    description?: string
  }

  staff_schedules?: StaffSchedule[]
}

export interface StaffSchedule {
  id?: number
  staff_id: number // ✅ Apunta a employees.id
  schedule_day_id: number
  cubicle_id?: number
  assignment_date?: string
  end_date?: string
  is_override?: boolean
  original_staff_id?: number // ✅ Apunta a employees.id
  status?: 'active' | 'cancelled' | 'completed'
  notes?: string
  created_at?: string
  updated_at?: string

  staff?: Staff // ✅ Devuelve Employee (pero usamos interface Staff)
  schedule_day?: ScheduleDay
  cubicle?: Cubicle
  original_staff?: Staff // ✅ Devuelve Employee
}
export interface ScheduleTemplate {
  id?: number
  name: string
  description?: string
  created_at?: string
  updated_at?: string

  schedule_days?: ScheduleDay[]
}

export interface ScheduleDay {
  id?: number
  schedule_template_id: number
  day_of_week?: number
  start_time: string
  end_time: string
  is_recurring?: boolean
  created_at?: string
  updated_at?: string

  schedule_template?: ScheduleTemplate
}

export interface Cubicle {
  id?: number
  code: string
  name: string
  location?: string
  capacity?: number
  features?: string[]
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

// ✅ CAMBIO: CreateStaffRequest usa firstname/lastname/active
export interface CreateStaffRequest {
  firstname: string
  lastname: string
  email?: string
  phone?: string
  cellphone?: string
  dni?: string
  address?: string
  position_id: number
  active?: boolean
}

export interface CreateScheduleTemplateRequest {
  name: string
  description?: string
  schedule_days: {
    day_of_week?: number
    start_time: string
    end_time: string
    is_recurring?: boolean
  }[]
}

export interface CreateStaffScheduleRequest {
  staff_id: number // ✅ Se envía a employees
  schedule_day_id: number
  cubicle_id?: number
  assignment_date?: string
  end_date?: string
  is_override?: boolean
  original_staff_id?: number // ✅ Se envía a employees
  status?: string
  notes?: string
}

export interface StaffFilters {
  active?: boolean | string
  search?: string
  position_id?: number
  paginate?: number
}

export interface ScheduleTemplateFilters {
  search?: string
  paginate?: number
}

export interface StaffScheduleFilters {
  staff_id?: number
  cubicle_id?: number
  status?: string
  is_recurring?: boolean | string
  date?: string
  paginate?: number
}

export const DAY_OF_WEEK_MAP: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
}

export const DAYS_OPTIONS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
]

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'completed', label: 'Completado' },
]
