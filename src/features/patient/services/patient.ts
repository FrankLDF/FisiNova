import serverCore from "../../../interceptors/axiosInstance";
import { buildQueryParams } from "../../../utils/urlParams";

class patientService {
  async getPatients(search?: string) {
    const params = buildQueryParams({ search });
    const res = await serverCore.get(`/patients?${params}`);
    return res.data;
  }
}

export default new patientService();
