import { Navigate, Route, Routes } from "react-router-dom";
import { PATH_ACCESS_DENIED, PATH_INICIAL, PATH_LOGIN, PATH_MAIN, PATH_NOT_FOUND } from "./pathts";
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
    </Routes>
  );
};

export default AppRoutes;
