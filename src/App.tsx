import './App.css'
import {RootLayout} from "./components/RootLayout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import store from "./store/Store.ts";
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import {Provider} from "react-redux";
import SignUp from "./components/Signup.tsx";
import Login from "./components/Login.tsx";
import ForgetPW from "./components/ForgetPW.tsx";
import DepartmentSection from "./pages/DepartmentSection.tsx";
import DoctorSection from "./pages/DoctorSection.tsx";
import NurseSection from "./pages/NurseSection.tsx";
import PatientSection from "./pages/PatientSection.tsx";
import AppointmentSection from "./pages/AppointmentSection.tsx";
import MedicineSection from "./pages/MedicineSection.tsx";
import MedicalReportSection from "./pages/MedicalReportSection.tsx";
import PaymentSection from "./pages/PaymentSection.tsx";
import SettingSection from "./pages/SettingSection.tsx";

function App() {
  const routes = createBrowserRouter([
    {
      path: '',
      element : <RootLayout/>,
      children: [
        { path: '', element: <Navigate to="/signup" replace /> },
        { path: '/signup', element: <SignUp /> },
        { path: '/login', element: <Login /> },
        { path: '/forgot-password', element: <ForgetPW /> },
        { path: '/dashboard', element: <Dashboard /> },
        { path: '/department', element: <DepartmentSection /> },
        { path: '/doctor', element: <DoctorSection/> },
        { path: '/nurse', element: <NurseSection /> },
        { path: '/patient', element: <PatientSection /> },
        { path: '/appointment', element: <AppointmentSection/> },
        { path: '/medicine', element: <MedicineSection /> },
        { path: '/report', element: <MedicalReportSection /> },
        { path: '/payment', element: <PaymentSection /> },
        { path: '/setting', element: <SettingSection /> },
      ],
    },
  ])

  return (
      <>
        <Provider store={store}>
          <RouterProvider router={routes} />
        </Provider>
      </>
  );
}

export default App
