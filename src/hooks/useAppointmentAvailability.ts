import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import appointmentAvaiabilityService, { type ValidationResponse } from '../features/appointment/services/appointmentAvailability'

export const useAppointmentAvailability = (
  doctorId: number | null,
  startDate?: string,
  endDate?: string,
  duration: number = 60
) => {
  const [validationError, setValidationError] = useState<string | null>(null)

  const {
    data: availability,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['appointment-availability', doctorId, startDate, endDate, duration],
    queryFn: async () => {
      if (!doctorId || !startDate || !endDate) {
        return { days: [], total_available_slots: 0 } as any
      }
      return await appointmentAvaiabilityService.getDoctorAvailability(
        doctorId,
        startDate,
        endDate
      )
    },
    enabled: !!doctorId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 2,
  })

  const validateSlot = async (
    date: string,
    time: string,
    excludeAppointmentId?: number
  ): Promise<ValidationResponse | null> => {
    if (!doctorId) return null

    try {
      const validation = await appointmentAvaiabilityService.validateTimeSlot(
        doctorId,
        date,
        time,
        duration
      )

      if (!validation.is_available) {
        setValidationError(validation.message)
      } else {
        setValidationError(null)
      }

      return validation
    } catch (err: any) {
      setValidationError(err.response?.data?.message || 'Error al validar el horario')
      return null
    }
  }

  const getNextAvailable = async (fromDate?: string) => {
    if (!doctorId) return null

    try {
      return await appointmentAvaiabilityService.getNextAvailableSlot(
        doctorId,
        fromDate
      )
    } catch (err) {
      console.error('Error getting next available:', err)
      return null
    }
  }

  return {
    availability: availability?.days || [],
    totalAvailableSlots: availability?.total_available_slots || 0,
    isLoading,
    error,
    validationError,
    refetch,
    validateSlot,
    getNextAvailable,
    clearValidationError: () => setValidationError(null),
  }
}