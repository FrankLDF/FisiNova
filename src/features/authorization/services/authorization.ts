// src/features/authorization/services/authorization.ts
import serverCore from "../../../interceptors/axiosInstance";
import { buildQueryParams } from "../../../utils/urlParams";
import type {
  CreateAuthorizationRequest,
  AuthorizationFilters,
  ConfirmAppointmentRequest,
} from "../models/authorization";

class AuthorizationService {
  async getAuthorizations(filters: AuthorizationFilters = {}) {
    const params = buildQueryParams(filters);
    const res = await serverCore.get(`/authorizations?${params}`);
    return res.data;
  }

  async getAuthorization(id: number) {
    const res = await serverCore.get(`/authorizations/${id}`);
    return res.data;
  }

  async createAuthorization(data: CreateAuthorizationRequest) {
    const res = await serverCore.post("/authorizations", data);
    return res.data;
  }

  async updateAuthorization(
    id: number,
    data: Partial<CreateAuthorizationRequest>
  ) {
    const res = await serverCore.put(`/authorizations/${id}`, data);
    return res.data;
  }

  async deleteAuthorization(id: number) {
    const res = await serverCore.delete(`/authorizations/${id}`);
    return res.data;
  }

  async confirmAppointment(
    appointmentId: number,
    data: ConfirmAppointmentRequest
  ) {
    const res = await serverCore.post(
      `/appointments/${appointmentId}/confirm`,
      data
    );
    return res.data;
  }

  async authorizeTherapy(appointmentId: number, data: any) {
    const res = await serverCore.post(
      `/authorizations/${appointmentId}/authorize-therapy`,
      data
    );
    return res.data;
  }
}

export default new AuthorizationService();