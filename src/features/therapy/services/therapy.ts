// src/features/therapy/services/therapy.ts
import serverCore from "../../../interceptors/axiosInstance";

export interface StartSessionRequest {
  initial_patient_state: string;
  initial_observations?: string;
}

export interface CompleteSessionRequest {
  procedure_ids?: number[];
  procedure_notes?: string;
  final_patient_state: string;
  final_observations?: string;
  next_session_recommendation?: string;
  intensity?: "low" | "moderate" | "high";
}

class TherapyService {
  /**
   * Obtener mis terapias del día
   */
  async getMyTherapies(date?: string) {
    const params = date ? `?date=${date}` : "";
    const res = await serverCore.get(`/therapies/my-therapies${params}`);
    return res.data;
  }

  /**
   * Obtener detalles de una sesión
   */
  async getSession(appointmentId: number) {
    const res = await serverCore.get(`/therapies/${appointmentId}`);
    return res.data;
  }

  /**
   * Iniciar una sesión de terapia
   */
  async startSession(appointmentId: number, data: StartSessionRequest) {
    const res = await serverCore.post(`/therapies/${appointmentId}/start`, data);
    return res.data;
  }

  /**
   * Completar una sesión de terapia
   */
  async completeSession(appointmentId: number, data: CompleteSessionRequest) {
    const res = await serverCore.post(`/therapies/${appointmentId}/complete`, data);
    return res.data;
  }
}

export default new TherapyService();
