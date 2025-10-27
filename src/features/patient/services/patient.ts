import serverCore from "../../../interceptors/axiosInstance";
import { buildQueryParams } from "../../../utils/urlParams";

class patientService {
  async getPatients(search?: string) {
    const params = buildQueryParams({ search });
    const res = await serverCore.get(`/patients?${params}`);
    return res.data;
  }

  async createPatient(data: any) {
    const res = await serverCore.post("/patients", data);
    return res.data;
  }
}

export default new patientService();
