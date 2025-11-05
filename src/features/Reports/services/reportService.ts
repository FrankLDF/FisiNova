// src/features/reports/services/reportService.ts
import serverCore from '../../../interceptors/axiosInstance';
import type { 
  ReportFilters, 
  ReportPreviewData, 
  ReportStats, 
  ApiResponse 
} from '../models/report';

class ReportService {
  /**
   * Vista previa de datos
   */
  async preview(data: ReportFilters): Promise<ReportPreviewData> {
    const response = await serverCore.post<ApiResponse<ReportPreviewData>>(
      '/reports/insurance/preview', 
      data
    );
    return response.data.data;
  }

  /**
   * Descargar reporte
   */
  async download(data: ReportFilters): Promise<void> {
    const response = await serverCore.post(
      '/reports/insurance/download', 
      data, 
      { responseType: 'blob' }
    );
    
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const extension = data.format === 'pdf' ? 'pdf' : 'xlsx';
    const insuranceName = data.is_idoppril ? 'IDOPPRIL' : 'Seguro';
    const filename = `Reporte_${insuranceName}_${new Date().getTime()}.${extension}`;
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Estadísticas para reportería
   */
  async getReportStats(params?: { start_date?: string; end_date?: string }): Promise<ReportStats> {
    const response = await serverCore.get<ApiResponse<ReportStats>>(
      '/reports/insurance/report-stats', 
      { params }
    );
    return response.data.data;
  }

  /**
   * Estadísticas por seguro
   */
  async getStatsByInsurance(params?: { start_date?: string; end_date?: string }): Promise<any[]> {
    const response = await serverCore.get<ApiResponse<any[]>>(
      '/reports/insurance/stats-by-insurance', 
      { params }
    );
    return response.data.data;
  }

  /**
   * Obtener lista de seguros
   */
  async getInsurances(): Promise<any[]> {
    const response = await serverCore.get('/insurances');
    return response.data.data || response.data;
  }
}

export default new ReportService();