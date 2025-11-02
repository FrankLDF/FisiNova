import { Navigate, Route, Routes } from "react-router-dom";
import {
  PATH_ACCESS_DENIED,
  PATH_CONSULTATIONS,
  PATH_INICIAL,
  PATH_LOGIN,
  PATH_MAIN,
  PATH_NOT_FOUND,
} from "./pathts";
import PublicRoutes from "./PublicRoutes";
import PrivateRoutes from "./PrivateRoutes";
import { NotFoundPage } from "../layout/NotFoundPage";
import { AccessDenied } from "../layout/AccesDenied";
import { Login } from "../features/auth/pages/Login";
import { ConsultAppointments } from "../features/appointment/pages/ConsultAppointment";
import { AppointmentForm } from "../features/appointment/pages/AppointmentForm";
import { PATH_CONSULT_APPOINTMENTS } from "../features/appointment/menu/path";
import { PATH_REGISTER_PERSONAL } from "../features/administrator/menu/path";
import { RoleProtectedRoute } from "./RoleProtectedRoutes";
import { Rol } from "../utils/constants";
import { StaffForm } from "../features/staff/pages/StaffForm";
import { ConsultStaff } from "../features/staff/pages/ConsultStaff";
import { ScheduleTemplateForm } from "../features/staff/pages/ScheduleTemplateForm";
import { ConsultScheduleTemplates } from "../features/staff/pages/ConsultScheduleTemplates";
import {
  PATH_ASSIGN_SCHEDULE,
  PATH_STAFF_SCHEDULES,
} from "../features/staff/menu/path";
import { AssignSchedule, ConsultStaffSchedules } from "../features/staff/pages";
import { MedicDashboard } from "../features/consultation/pages/MedicDashboard";
import { ConsultationForm } from "../features/consultation/pages/ConsultationForm";
import { isMedic } from "../utils/authFunctions";
import { useAuth } from "../store/auth/AuthContext";
import { use } from "react";

const AppRoutes = () => {
  const { user } = useAuth();

  if (!user) {
    return <></>;
  }
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

      {/* Redirigir /home según el rol del usuario */}
      {isMedic(user.rols) ? (
        <Route
          path={PATH_MAIN}
          element={
            <PrivateRoutes>
              <Navigate to={PATH_CONSULTATIONS} replace />
            </PrivateRoutes>
          }
        />
      ) : (
        <Route
          path={PATH_MAIN}
          element={
            <PrivateRoutes>
              <Navigate to={PATH_CONSULT_APPOINTMENTS} replace />
            </PrivateRoutes>
          }
        />
      )}

      {/* Ruta de acceso denegado */}
      <Route path={PATH_ACCESS_DENIED} element={<AccessDenied />} />

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

      {/* ✅ Rutas de Consultas Médicas */}
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

      {/* Rutas de Personal y Horarios */}
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
        path={PATH_ASSIGN_SCHEDULE}
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <AssignSchedule />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      <Route
        path={PATH_STAFF_SCHEDULES}
        element={
          <PrivateRoutes>
            <RoleProtectedRoute allowedRoles={[Rol.ADMIN]}>
              <ConsultStaffSchedules />
            </RoleProtectedRoute>
          </PrivateRoutes>
        }
      />

      {/* 404 */}
      <Route path={PATH_NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
