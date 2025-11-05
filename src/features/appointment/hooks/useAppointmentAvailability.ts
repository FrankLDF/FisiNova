import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import appointmentService, { 
  type ValidationResponse, 
  type DayAvailability 
} from '../services/appointment'

export const useAppointmentAvailability = (
  doctorId: number | null,
  startDate?: string,
  endDate?: string,
  duration: number = 60
) => {
  const [validationError, setValidationError] = useState<string | null>(null)

  // Query para obtener disponibilidad
  const {
    data: availability,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['appointment-availability', doctorId, startDate, endDate, duration],
    queryFn: async () => {
      if (!doctorId || !startDate || !endDate) {
        return null
      }
      return await appointmentService.getDoctorAvailability(
        doctorId,
        startDate,
        endDate,
        duration
      )
    },
    enabled: !!doctorId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
  })

  // Validar un slot específico
  const validateSlot = async (
    date: string,
    time: string,
    excludeAppointmentId?: number
  ): Promise<ValidationResponse | null> => {
    if (!doctorId) {
      setValidationError('Debe seleccionar un doctor')
      return null
    }

    try {
      const validation = await appointmentService.validateTimeSlot(
        doctorId,
        date,
        time,
        duration,
        excludeAppointmentId
      )

      if (!validation.is_available) {
        setValidationError(validation.message)
      } else {
        setValidationError(null)
      }

      return validation
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al validar el horario'
      setValidationError(errorMsg)
      return null
    }
  }

  // Obtener siguiente slot disponible
  const getNextAvailable = async (fromDate?: string) => {
    if (!doctorId) return null

    try {
      return await appointmentService.getNextAvailableSlot(doctorId, fromDate, duration)
    } catch (err) {
      console.error('Error obteniendo siguiente slot:', err)
      return null
    }
  }

  return {
    // Datos de disponibilidad
    availability: availability?.days || [],
    totalAvailableSlots: availability?.total_available_slots || 0,
    dateRange: availability?.date_range,
    
    // Estado
    isLoading,
    error,
    validationError,
    
    // Métodos
    refetch,
    validateSlot,
    getNextAvailable,
    clearValidationError: () => setValidationError(null),
  }
}
