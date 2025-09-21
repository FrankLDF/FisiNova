export const GENDER_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
] as const

const GENDER_MAP = new Map([
  ['M', 'Masculino'],
  ['F', 'Femenino'],
  ['m', 'Masculino'],
  ['f', 'Femenino'],
  ['male', 'Masculino'],
  ['female', 'Femenino'],
])

export const getGenderLabel = (value?: string): string => {
  if (!value) return ''
  return GENDER_MAP.get(value.toLowerCase()) || ''
}