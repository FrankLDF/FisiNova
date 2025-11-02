// src/utils/dateHelpers.ts
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * Verifica si una fecha es hoy
 */
export const isToday = (date: string | Dayjs): boolean => {
  const targetDate = dayjs(date);
  const today = dayjs().startOf("day");
  const endOfToday = dayjs().endOf("day");

  return (
    targetDate.isSameOrAfter(today) && targetDate.isSameOrBefore(endOfToday)
  );
};

/**
 * Verifica si una fecha es en el futuro
 */
export const isFuture = (date: string | Dayjs): boolean => {
  return dayjs(date).isAfter(dayjs());
};

/**
 * Verifica si una fecha es en el pasado
 */
export const isPast = (date: string | Dayjs): boolean => {
  return dayjs(date).isBefore(dayjs().startOf("day"));
};

/**
 * Obtiene el nombre del día en español
 */
export const getDayName = (date: string | Dayjs): string => {
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return days[dayjs(date).day()];
};
