import { Rol } from "./constants";

export const isAdmin = (userRoles: number[]): boolean => {
  return userRoles?.includes(Rol.ADMIN) ?? false;
};

export const isSecretary = (userRoles: number[]): boolean => {
  return userRoles?.includes(Rol.SECRETARY) ?? false;
};

export const isMedic = (userRoles: number[]): boolean => {
  return userRoles?.includes(Rol.MEDIC) ?? false;
};

export const isTherapist = (userRoles: number[]): boolean => {
  return userRoles?.includes(Rol.THERAPIST) ?? false;
};

export const hasAnyRole = (userRoles?: number[], roles?: number[]): boolean => {
  if (!userRoles || !roles) return false;
  return roles.some((role) => userRoles.includes(role));
};
