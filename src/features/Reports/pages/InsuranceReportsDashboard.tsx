import React, { useState, useEffect } from 'react'
import {
  Calendar,
  FileText,
  Download,
  Eye,
  Filter,
  DollarSign,
  Users,
  FileSpreadsheet,
} from 'lucide-react'

const InsuranceReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState('generate')
  const [selectedInsurance, setSelectedInsurance] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [format, setFormat] = useState('pdf')
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [stats, setStats] = useState(null)

  // Mock data - reemplazar con llamadas API reales
  const insurances = [
    { id: 1, name: 'SENASA', code: 'SNS' },
    { id: 2, name: 'HUMANO', code: 'HUM' },
    { id: 3, name: 'ARS PALIC', code: 'PAL' },
    { id: 4, name: 'ARL', code: 'ARL' },
    { id: 5, name: 'IDOPPRIL', code: 'IDOPPRIL' },
  ]

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    // TODO: Llamar API real
    setStats({
      current_month_amount: '$125,430.00',
      services_performed: 248,
      patients_attended: 156,
      insurance_amount: '$110,250.00',
      patient_amount: '$15,180.00',
    })
  }

  const handlePreview = async () => {
    if (!selectedInsurance || !dateRange.start || !dateRange.end) {
      alert('Por favor complete todos los filtros requeridos')
      return
    }

    setLoading(true)

    try {
      // TODO: Llamar API real
      // const response = await reportService.preview({
      //   insurance_id: selectedInsurance,
      //   start_date: dateRange.start,
      //   end_date: dateRange.end,
      // });

      // Simular respuesta
      setTimeout(() => {
        const insurance = insurances.find((i) => i.id === parseInt(selectedInsurance))
        const isWorkplaceRisk = ['ARL', 'IDOPPRIL'].includes(insurance?.code)

        setPreviewData({
          insurance: insurance,
          is_workplace_risk: isWorkplaceRisk,
          period: {
            start: dateRange.start,
            end: dateRange.end,
          },
          summary: {
            total_services: 42,
            total_insurance_amount: 52360.0,
            total_patient_amount: 4500.0,
            total_amount: 56860.0,
            consultations_count: 11,
            therapies_count: 30,
            admissions_count: 1,
          },
          services: [
            {
              authorization_date: '2025-01-24',
              patient_name: 'Alina Guillermo',
              patient_last_name: 'Lora Lora',
              patient_insurance_code: '037777415',
              case_number: null,
              authorization_number: '1875423114',
              procedure_description: 'CONSULTA',
              insurance_amount: 500.0,
              patient_amount: 0.0,
              total_amount: 500.0,
            },
            {
              authorization_date: '2025-01-27',
              patient_name: 'Alina Guillermo',
              patient_last_name: 'Lora Lora',
              patient_insurance_code: '037777415',
              case_number: null,
              authorization_number: '1875612736',
              procedure_description: 'TERAPIA',
              insurance_amount: 1440.0,
              patient_amount: 360.0,
              total_amount: 1800.0,
            },
            {
              authorization_date: '2025-01-08',
              patient_name: 'Dulce Maria',
              patient_last_name: 'Brito',
              patient_insurance_code: '050985211',
              case_number: null,
              authorization_number: '1873872852',
              procedure_description: 'CONSULTA',
              insurance_amount: 500.0,
              patient_amount: 0.0,
              total_amount: 500.0,
            },
          ],
        })
        setActiveTab('preview')
        setLoading(false)
      }, 1500)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar vista previa')
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!selectedInsurance || !dateRange.start || !dateRange.end) {
      alert('Por favor complete todos los filtros requeridos')
      return
    }

    setLoading(true)

    try {
      const response = await reportService.download({
        insurance_id: selectedInsurance,
        start_date: dateRange.start,
        end_date: dateRange.end,
        format: format,
      })
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al descargar reporte')
      setLoading(false)
    }
  }

  const statsCards = [
    {
      label: 'Total Reclamado',
      value: stats?.current_month_amount || '$0.00',
      icon: DollarSign,
      color: 'bg-blue-500',
      subtitle: 'Mes actual',
    },
    {
      label: 'Monto Seguros',
      value: stats?.insurance_amount || '$0.00',
      icon: FileText,
      color: 'bg-green-500',
      subtitle: 'Pago de ARS',
    },
    {
      label: 'Copagos',
      value: stats?.patient_amount || '$0.00',
      icon: Users,
      color: 'bg-purple-500',
      subtitle: 'Pago de pacientes',
    },
    {
      label: 'Servicios',
      value: stats?.services_performed || '0',
      icon: FileSpreadsheet,
      color: 'bg-orange-500',
      subtitle: 'Este mes',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportería de Seguros</h1>
          <p className="text-gray-600">
            Centro de Rehabilitación Física Fisinova - RNC: 131-66268-4
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('generate')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'generate'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={18} />
                  Generar Reporte
                </div>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Eye size={18} />
                  Vista Previa
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'generate' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Seguro */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ARS / Seguro <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedInsurance}
                      onChange={(e) => setSelectedInsurance(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccione un seguro</option>
                      {insurances.map((ins) => (
                        <option key={ins.id} value={ins.id}>
                          {ins.name} ({ins.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Formato */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formato de Exportación
                    </label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                    </select>
                  </div>

                  {/* Fecha Inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Fecha Fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handlePreview}
                    disabled={loading}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Eye size={18} />
                    Vista Previa
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Descargar {format.toUpperCase()}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div>
                {previewData ? (
                  <div className="space-y-6">
                    {/* Preview Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
                      <h2 className="text-xl font-bold mb-4">
                        RECLAMACIÓN - {previewData.insurance.name}
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="opacity-80">Período:</p>
                          <p className="font-semibold">
                            {new Date(previewData.period.start).toLocaleDateString()} -{' '}
                            {new Date(previewData.period.end).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="opacity-80">Servicios:</p>
                          <p className="font-semibold">{previewData.summary.total_services}</p>
                        </div>
                        <div>
                          <p className="opacity-80">Monto Seguro:</p>
                          <p className="font-semibold">
                            ${previewData.summary.total_insurance_amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="opacity-80">Total:</p>
                          <p className="font-semibold text-xl">
                            ${previewData.summary.total_amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Preview Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-3 py-3 text-left font-semibold text-gray-700">#</th>
                              <th className="px-3 py-3 text-left font-semibold text-gray-700">
                                Fecha
                              </th>
                              <th className="px-3 py-3 text-left font-semibold text-gray-700">
                                Afiliado
                              </th>
                              <th className="px-3 py-3 text-left font-semibold text-gray-700">
                                {previewData.is_workplace_risk ? 'No. Caso' : 'No. Afiliado'}
                              </th>
                              <th className="px-3 py-3 text-left font-semibold text-gray-700">
                                Autorización
                              </th>
                              <th className="px-3 py-3 text-left font-semibold text-gray-700">
                                Procedimiento
                              </th>
                              <th className="px-3 py-3 text-right font-semibold text-gray-700">
                                Seguro
                              </th>
                              <th className="px-3 py-3 text-right font-semibold text-gray-700">
                                Copago
                              </th>
                              <th className="px-3 py-3 text-right font-semibold text-gray-700">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {previewData.services.map((row, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-3 text-gray-600">{idx + 1}</td>
                                <td className="px-3 py-3 text-gray-900">
                                  {new Date(row.authorization_date).toLocaleDateString()}
                                </td>
                                <td className="px-3 py-3 text-gray-900">
                                  {row.patient_name} {row.patient_last_name}
                                </td>
                                <td className="px-3 py-3 text-gray-600 font-mono text-xs">
                                  {previewData.is_workplace_risk
                                    ? row.case_number
                                    : row.patient_insurance_code}
                                </td>
                                <td className="px-3 py-3 text-gray-600 font-mono text-xs">
                                  {row.authorization_number}
                                </td>
                                <td className="px-3 py-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      row.procedure_description === 'CONSULTA'
                                        ? 'bg-blue-100 text-blue-700'
                                        : row.procedure_description === 'TERAPIA'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {row.procedure_description}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-right font-semibold text-green-700">
                                  ${row.insurance_amount.toLocaleString()}
                                </td>
                                <td className="px-3 py-3 text-right font-semibold text-orange-700">
                                  ${row.patient_amount.toLocaleString()}
                                </td>
                                <td className="px-3 py-3 text-right font-semibold text-gray-900">
                                  ${row.total_amount.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                            <tr>
                              <td
                                colSpan="6"
                                className="px-3 py-4 text-right font-bold text-gray-900"
                              >
                                TOTAL:
                              </td>
                              <td className="px-3 py-4 text-right font-bold text-green-600 text-base">
                                ${previewData.summary.total_insurance_amount.toLocaleString()}
                              </td>
                              <td className="px-3 py-4 text-right font-bold text-orange-600 text-base">
                                ${previewData.summary.total_patient_amount.toLocaleString()}
                              </td>
                              <td className="px-3 py-4 text-right font-bold text-blue-600 text-lg">
                                ${previewData.summary.total_amount.toLocaleString()}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* Download Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setActiveTab('generate')}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        ← Volver a Filtros
                      </button>
                      <button
                        onClick={handleDownload}
                        disabled={loading}
                        className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                      >
                        <Download size={18} />
                        Descargar {format.toUpperCase()}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Eye className="mx-auto text-gray-400 mb-4" size={64} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay vista previa disponible
                    </h3>
                    <p className="text-gray-600 mb-4">Genera un reporte para ver la vista previa</p>
                    <button
                      onClick={() => setActiveTab('generate')}
                      className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Generar Reporte
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InsuranceReportsDashboard
