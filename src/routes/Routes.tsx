import { Navigate, Route, Routes } from 'react-router-dom'
import {
  PATH_ACCESS_DENIED,
  PATH_CONSULTATIONS,
  PATH_INICIAL,
  PATH_LOGIN,
  PATH_MAIN,
  PATH_NOT_FOUND,
  PATH_THERAPIST_DASHBOARD,
} from './pathts'
import PublicRoutes from './PublicRoutes'
import PrivateRoutes from './PrivateRoutes'
import { NotFoundPage } from '../layout/NotFoundPage'
import { AccessDenied } from '../layout/AccesDenied'
import { Login } from '../features/auth/pages/Login'

// ========== CITAS ==========
import { ConsultAppointments } from '../features/appointment/pages/ConsultAppointment'
import { AppointmentForm } from '../features/appointment/pages/AppointmentForm'
import { PATH_CONSULT_APPOINTMENTS } from '../features/appointment/menu/path'

// ========== PERSONAL Y HORARIOS ==========
import { StaffForm } from '../features/staff/pages/StaffForm'
import { ConsultStaff } from '../features/staff/pages/ConsultStaff'
import { ScheduleTemplateForm } from '../features/staff/pages/ScheduleTemplateForm'
import { ConsultScheduleTemplates } from '../features/staff/pages/ConsultScheduleTemplates'
import { AssignSchedule, ConsultStaffSchedules } from '../features/staff/pages'

// ========== CONSULTAS MÉDICAS ==========
import { MedicDashboard } from '../features/consultation/pages/MedicDashboard'
import { ConsultationForm } from '../features/consultation/pages/ConsultationForm'

// ========== USUARIOS ==========
import { ConsultUsers } from '../features/users/pages/ConsultUsers'
import { UserForm } from '../features/users/pages/UserForm'

// ========== OTROS ==========
import { RoleProtectedRoute } from './RoleProtectedRoutes'
import { Rol } from '../utils/constants'
import { isMedic, isSecretary, isTherapist } from '../utils/authFunctions'
import { useAuth } from '../store/auth/AuthContext'
import { TherapistDashboard } from '../features/therapy/pages/TherapistDashboard'
import { InsuranceForm } from '../features/insurances/pages/InsuranceForm'
import { ConsultInsurances } from '../features/insurances/pages/ConsultInsurances'
import InsuranceReportsDashboard from '../features/Reports/pages/InsuranceReportsDashboard'
import { PatientForm } from '../features/patient/pages/PatientForm'
import { ConsultPatients } from '../features/patient/pages/ConsultPatients'
import { PATH_BACKUP_MANAGEMENT } from '../features/backup/menu/backup'
import { BackupManagement } from '../features/backup/pages/BackupManagement'

const AppRoutes = () => {
  const { user } = useAuth()

  let dashboardPath = PATH_MAIN

  if (isMedic(user?.rols || [])) {
    dashboardPath = PATH_CONSULTATIONS
  }

  if (isTherapist(user?.rols || [])) {
    dashboardPath = PATH_THERAPIST_DASHBOARD
  }

  if (isSecretary(user?.rols || [])) {
    dashboardPath = PATH_CONSULT_APPOINTMENTS
  }

  return (
    <Routes>
      {/* ========== RUTAS PÚBLICAS ========== */}
      <Route
        path={PATH_LOGIN}
        element={
          <PublicRoutes>
            <Login />
          </PublicRoutes>
        }
      />
      <Route
        path={PATH_INICIAL}
        element={<Navigate to={PATH_LOGIN} replace />}
      />

      {/* ========== REDIRECCIÓN SEGÚN ROL ========== */}
      <Route
        path={PATH_MAIN}
        element={
          <PrivateRoutes>
            <Navigate to={dashboardPath} replace />
          </PrivateRoutes>
        }
      />

      {/* ========== ACCESO DENEGADO ========== */}
      <Route path={PATH_ACCESS_DENIED} element={<AccessDenied />} />

      {/* ========== CITAS ========== */}
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

      {/* ========== CONSULTAS MÉDICAS ========== */}
      <Route
        path={PATH_CONSULTATIONS}
        element={
          <PrivateRoutes>
            <RoleProtectedRoute
              allowedRoles={[Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST]}
            >
              <MedicDashboard />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/consultation/:id"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute
              allowedRoles={[Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST]}
            >
              <ConsultationForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/consultation/:id/view"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute
              allowedRoles={[Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST]}
            >
              <ConsultationForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      {/* ========== PERSONAL ========== */}
      <Route
        path="/consult-staff"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <ConsultStaff />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/create-staff"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <StaffForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/staff/:id"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <StaffForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/staff/:id/edit"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <StaffForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      {/* ========== HORARIOS ========== */}
      <Route
        path="/consult-schedules"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <ConsultScheduleTemplates />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/create-schedule-template"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <ScheduleTemplateForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/schedule-templates/:id/edit"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <ScheduleTemplateForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/assign-schedule"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <AssignSchedule />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/staff-schedules"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <ConsultStaffSchedules />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      {/* ========== USUARIOS ========== */}
      <Route
        path="/consult-users"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <ConsultUsers />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/create-user"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <UserForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/users/:id"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <UserForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/users/:id/edit"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <UserForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path={PATH_THERAPIST_DASHBOARD}
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN, Rol.THERAPIST]}>
              <TherapistDashboard />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />
      <Route
        path="/consult-insurances"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN, Rol.SECRETARY]}>
              <ConsultInsurances />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/create-insurance"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <InsuranceForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/insurances/:id"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN, Rol.SECRETARY]}>
              <InsuranceForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/insurances/:id/edit"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <InsuranceForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/reports-dashboard"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN, Rol.SECRETARY]}>
              <InsuranceReportsDashboard />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/consult-patients"
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
              <ConsultPatients />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/create-patient"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN, Rol.SECRETARY]}>
              <PatientForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/patients/:id"
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
              <PatientForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path="/patients/:id/edit"
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN, Rol.SECRETARY]}>
              <PatientForm />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path={PATH_BACKUP_MANAGEMENT}
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <BackupManagement />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      {/* ========== 404 ========== */}
      <Route path={PATH_NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
