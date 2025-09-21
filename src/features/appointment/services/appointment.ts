import serverCore from "../../../interceptors/axiosInstance";
import { buildQueryParams } from "../../../utils/urlParams";
import type {
  CreateAppointmentRequest,
  AppointmentFilters,
} from "../models/appointment";

class AppointmentService {
  async getAppointments(filters: AppointmentFilters = {}) {
    const params = buildQueryParams(filters);
    const res = await serverCore.get(`/appointments?${params}`);
    return res.data;
  }

  async getAppointment(id: number) {
    const res = await serverCore.get(`/appointments/${id}`);
    return res.data;
  }

  async createAppointment(data: CreateAppointmentRequest) {
    const res = await serverCore.post("/appointments", data);
    return res.data;
  }

  async updateAppointment(id: number, data: Partial<CreateAppointmentRequest>) {
    const res = await serverCore.put(`/appointments/${id}`, data);
    return res.data;
  }

  async deleteAppointment(id: number) {
    const res = await serverCore.delete(`/appointments/${id}`);
    return res.data;
  }

  async getEmployees(search?: string) {
    const params = new URLSearchParams();
    params.append("type", "medical");

    if (search) {
      params.append("search", search);
    }

    const res = await serverCore.get(`/employees?${params.toString()}`);
    return res.data;
  }

  async checkAvailability(
    employeeId: number,
    date: string,
    startTime: string,
    endTime: string
  ) {
    const res = await serverCore.post("/appointments/check-availability", {
      employee_id: employeeId,
      appointment_date: date,
      start_time: startTime,
      end_time: endTime,
    });
    return res.data;
  }

  async getAppointmentsByEmployeeAndDate(employeeId: number, date: string) {
    const res = await serverCore.get(
      `/appointments/employee/${employeeId}/date/${date}`
    );
    return res.data;
  }

  async getAvaiableInsuranceCompanies() {
    const defaultFilter = {
      status: "active",
    };
    const params = buildQueryParams(defaultFilter);

    const res = await serverCore.get(`/insurances?${params}`);
    return res.data;
  }
}

export default new AppointmentService();
