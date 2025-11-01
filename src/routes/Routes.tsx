import { Navigate, Route, Routes } from 'react-router-dom'
import {
  PATH_ACCESS_DENIED,
  PATH_CONSULTATIONS,
  PATH_INICIAL,
  PATH_LOGIN,
  PATH_MAIN,
  PATH_NOT_FOUND,
} from './pathts'
import PublicRoutes from './PublicRoutes'
import PrivateRoutes from './PrivateRoutes'
import { NotFoundPage } from '../layout/NotFoundPage'
import { AccessDenied } from '../layout/AccesDenied'
import { Login } from '../features/auth/pages/Login'
import { ConsultAppointments } from '../features/appointment/pages/ConsultAppointment'
import { AppointmentForm } from '../features/appointment/pages/AppointmentForm'
import { PATH_CONSULT_APPOINTMENTS } from '../features/appointment/menu/path'
import { PATH_REGISTER_PERSONAL } from '../features/administrator/menu/path'
import { RoleProtectedRoute } from './RoleProtectedRoutes'
import { Rol } from '../utils/constants'
import { StaffForm } from '../features/staff/pages/StaffForm'
import { ConsultStaff } from '../features/staff/pages/ConsultStaff'
import { ScheduleTemplateForm } from '../features/staff/pages/ScheduleTemplateForm'
import { ConsultScheduleTemplates } from '../features/staff/pages/ConsultScheduleTemplates'
import {
  PATH_ASSIGN_SCHEDULE,
  PATH_STAFF_SCHEDULES,
} from '../features/staff/menu/path'
import { AssignSchedule, ConsultStaffSchedules } from '../features/staff/pages'
import { MedicConsultations } from '../features/consultation/pages/MedicConsultation'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path={PATH_LOGIN}
        element={
          <PublicRoutes>
            <Login />
          </PublicRoutes>
        }
      />

      {/* Redirigir raíz a login */}
      <Route
        path={PATH_INICIAL}
        element={<Navigate to={PATH_LOGIN} replace />}
      />

      {/* Redirigir /home a consultar citas */}
      <Route
        path={PATH_MAIN}
        element={<PrivateRoutes>Holaa desde aqui</PrivateRoutes>}
      />

      {/* ✅ Ruta de acceso denegado */}
      <Route path={PATH_ACCESS_DENIED} element={<AccessDenied />} />

      <Route
        path={PATH_REGISTER_PERSONAL}
        element={<PrivateRoutes>Estas registrando un personal</PrivateRoutes>}
      />

      {/* Rutas de citas */}
      <Route
        path={PATH_CONSULT_APPOINTMENTS}
        element={
          <PrivateRoutes>
            <RoleProtectedRoute
              allowedRoles={[
                Rol.ADMIN,
                Rol.SECRETARY,
                Rol.MEDIC,
                Rol.THERAPIST,
              ]}
            >
              <ConsultAppointments />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/create-appointment"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN, Rol.SECRETARY]}>
              <AppointmentForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/appointments/:id"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN, Rol.SECRETARY]}>
              <AppointmentForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/appointments/:id/edit"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN, Rol.SECRETARY]}>
              <AppointmentForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      {/* 404 */}
      <Route path={PATH_NOT_FOUND} element={<NotFoundPage />} />
      <Route
        path="/consult-staff"
        element={
          <PrivateRoutes>
            <ConsultStaff />
          </PrivateRoutes>
        }
      />
      <Route
        path="/create-staff"
        element={
          <PrivateRoutes>
            <StaffForm />
          </PrivateRoutes>
        }
      />
      <Route
        path="/staff/:id"
        element={
          <PrivateRoutes>
            <StaffForm />
          </PrivateRoutes>
        }
      />
      <Route
        path="/staff/:id/edit"
        element={
          <PrivateRoutes>
            <StaffForm />
          </PrivateRoutes>
        }
      />

      <Route
        path="/consult-schedules"
        element={
          <PrivateRoutes>
            <ConsultScheduleTemplates />
          </PrivateRoutes>
        }
      />
      <Route
        path="/create-schedule-template"
        element={
          <PrivateRoutes>
            <ScheduleTemplateForm />
          </PrivateRoutes>
        }
      />
      <Route
        path="/schedule-templates/:id/edit"
        element={
          <PrivateRoutes>
            <ScheduleTemplateForm />
          </PrivateRoutes>
        }
      />
      <Route
        path={PATH_ASSIGN_SCHEDULE}
        element={
          <PrivateRoutes>
            <AssignSchedule />
          </PrivateRoutes>
        }
      />
      <Route
        path={PATH_STAFF_SCHEDULES}
        element={
          <PrivateRoutes>
            <ConsultStaffSchedules />
          </PrivateRoutes>
        }
      />
      <Route
        path={PATH_CONSULTATIONS}
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST]}>
              <MedicConsultations />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />
    </Routes>
  )
}

export default AppRoutes
