// src/features/staff/models/staff.ts

export interface Staff {
  id?: number
  first_name: string
  last_name: string
  email?: string
  phone?: string
  position_id: number
  is_active?: boolean
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
  staff_id: number
  schedule_day_id: number
  cubicle_id?: number
  assignment_date?: string
  end_date?: string
  is_override?: boolean
  original_staff_id?: number
  status?: 'active' | 'cancelled' | 'completed'
  notes?: string
  created_at?: string
  updated_at?: string

  staff?: Staff
  schedule_day?: ScheduleDay
  cubicle?: Cubicle
  original_staff?: Staff
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
  day_of_week?: number // 1-7 (Lunes-Domingo), null para flexible
  start_time: string // HH:mm format
  end_time: string // HH:mm format
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

export interface CreateStaffRequest {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  position_id: number
  is_active?: boolean
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
  staff_id: number
  schedule_day_id: number
  cubicle_id?: number
  assignment_date?: string
  end_date?: string
  is_override?: boolean
  original_staff_id?: number
  status?: string
  notes?: string
}

export interface StaffFilters {
  is_active?: boolean | string
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
