import { Navigate, Route, Routes } from "react-router-dom";
import { PATH_INICIAL, PATH_LOGIN, PATH_MAIN, PATH_NOT_FOUND } from "./pathts";
import PublicRoutes from "./PublicRoutes";
import PrivateRoutes from "./PrivateRoutes";
import NotFaundPage from "../layout/NotFaundPage";
import { Login } from "../features/auth/pages/Login";
import { PATH_REGISTER_PERSONAL } from "../features/administrator/menu/path";
import { ConsultAppointments } from "../features/appointment/pages/ConsultAppointment";
import { AppointmentForm } from "../features/appointment/pages/AppointmentForm";

const AppRoutes = () => {
  return (
    <Routes>
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
      <Route
        path={PATH_MAIN}
        element={<PrivateRoutes>Holaa desde aqui</PrivateRoutes>}
      />
      <Route
        path={PATH_REGISTER_PERSONAL}
        element={<PrivateRoutes>Estas registrando un personal</PrivateRoutes>}
      />

      <Route
        path="/consult-appointments"
        element={
          <PrivateRoutes>
            <ConsultAppointments />
          </PrivateRoutes>
        }
      />

      <Route
        path="/create-appointment"
        element={
          <PrivateRoutes>
            <AppointmentForm />
          </PrivateRoutes>
        }
      />

      <Route
        path="/appointments/:id"
        element={
          <PrivateRoutes>
            <AppointmentForm />
          </PrivateRoutes>
        }
      />

      <Route
        path="/appointments/:id/edit"
        element={
          <PrivateRoutes>
            <AppointmentForm />
          </PrivateRoutes>
        }
      />

      <Route path={PATH_NOT_FOUND} element={<NotFaundPage />} />
    </Routes>
  );
};

export default AppRoutes;
