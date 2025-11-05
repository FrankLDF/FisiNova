// src/features/appointment/hooks/useEmployeeAvailability.ts
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import appointmentService from '../services/appointment'

export interface TimeSlot {
  start_time: string
  end_time: string
  display: string
  is_available: boolean
  cubicle?: string
}

export interface DayAvailability {
  date: string
  day_name: string
  day_of_week: number
  slots: TimeSlot[]
  available_count: number
  total_count: number
}

export const useEmployeeAvailability = (
  employeeId: number | null,
  startDate?: string,
  endDate?: string,
  duration: number = 60
) => {
  const [validationError, setValidationError] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['employee-availability', employeeId, startDate, endDate, duration],
    queryFn: async () => {
      if (!employeeId || !startDate || !endDate) {
        return null
      }
      const response = await appointmentService.getEmployeeAvailability(
        employeeId,
        startDate,
        endDate,
        duration
      )
      return response.data
    },
    enabled: !!employeeId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 2, // 2 minutos
  })

  const validateSlot = async (date: string, time: string, excludeAppointmentId?: number) => {
    if (!employeeId) return null

    try {
      const response = await appointmentService.validateTimeSlot(
        employeeId,
        date,
        time,
        duration,
        excludeAppointmentId
      )

      const validation = response.data

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

  const getNextAvailable = async (fromDate?: string) => {
    if (!employeeId) return null

    try {
      const response = await appointmentService.getNextAvailable(employeeId, fromDate, duration)
      return response.data
    } catch (err) {
      console.error('Error getting next available:', err)
      return null
    }
  }

  return {
    availability: data?.days || [],
    totalAvailableSlots: data?.total_available_slots || 0,
    isLoading,
    error,
    validationError,
    refetch,
    validateSlot,
    getNextAvailable,
    clearValidationError: () => setValidationError(null),
  }
}
