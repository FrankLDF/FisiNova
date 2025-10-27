export interface Appointment {
  id?: number;
  employee_id: number;
  patient_id?: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status?: string;
  notes?: string;
  dni?: string;
  phone?: string;
  passport?: string;
  insurance_code?: string;
  insurance_id?: number;
  guest_firstname?: string;
  guest_lastname?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;

  employee?: {
    id: number;
    firstname: string;
    lastname: string;
  };
  patient?: {
    id: number;
    firstname: string;
    lastname: string;
    dni?: string;
    phone?: string;
  };
  insurance?: {
    id: number;
    name: string;
  };
  payment_type?: "insurance" | "private";
  authorization_number?: string;
  confirmed_at?: string;
  confirmed_by?: number;

  confirmedBy?: {
    id: number;
    name: string;
  };
}

export interface CreateAppointmentRequest {
  employee_id: number;
  patient_id?: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status?: string;
  notes?: string;
  dni?: string;
  phone?: string;
  passport?: string;
  insurance_code?: string;
  insurance_id?: number;
  guest_firstname?: string;
  guest_lastname?: string;
}

export interface AppointmentFilters {
  active?: boolean | string;
  start_date?: string;
  end_date?: string;
  employee_id?: number;
  patient_id?: number;
  status?: string;
  paginate?: number;
}
