// pages/Dashboard.tsx
import { Navigation } from "../components/Navigation";
import { Header } from "../components/Header";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import {
  CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis,
} from "recharts";
import axios from "axios";
import { Card, Col, Container, Row } from "react-bootstrap";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patientCount, setPatientCount] = useState(0);
  const [doctorCount, setDoctorCount] = useState(0);
  const [medicineCount, setMedicineCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  // PRESERVED DATA
  const incomeData = [
    { name: "Jan", income: 5000, target: 5500 },
    { name: "Feb", income: 6200, target: 6000 },
    { name: "Mar", income: 7200, target: 7500 },
    { name: "Apr", income: 8500, target: 8200 },
    { name: "May", income: 9200, target: 9500 },
    { name: "Jun", income: 9800, target: 10000 },
    { name: "Jul", income: 10500, target: 11000 },
  ];

  const doctorsData = [
    { id: 1, name: "Dr. John Doe", specialty: "Cardiologist", img: "doctor01.jpg" },
    { id: 2, name: "Dr. Jane Smith", specialty: "Dermatologist", img: "doctor3.jpg" },
    { id: 3, name: "Dr. Emily White", specialty: "Pediatrician", img: "doctor4.jpg" },
    { id: 4, name: "Dr. Mark Brown", specialty: "Orthopedic", img: "doctor5.png" },
    { id: 5, name: "Dr. Sarah Connor", specialty: "Neurologist", img: "doctor-5.jpg" },
    { id: 6, name: "Dr. Alex Johnson", specialty: "ENT Specialist", img: "doctor-6.jpg" },
    { id: 7, name: "Dr. Kevin Harris", specialty: "General Physician", img: "doctor-7.jpg" },
  ];

  const springProps = useSpring({ opacity: 1, from: { opacity: 0 } });

  // PRESERVED API CALLS
  useEffect(() => {
    axios.get("http://localhost:3003/patient/patient-count", {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    }).then(r => setPatientCount(r.data)).catch(console.error);

    axios.get("http://localhost:3003/doctor/doctor-count", {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    }).then(r => setDoctorCount(r.data)).catch(console.error);

    axios.get("http://localhost:3003/medicine/medicine-count", {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    }).then(r => setMedicineCount(r.data)).catch(console.error);

    axios.get("http://localhost:3003/appointment/appointment-count", {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    }).then(r => setAppointmentCount(r.data)).catch(console.error);

    axios.get("http://localhost:3003/payment/total-income", {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    }).then(r => setTotalIncome(r.data.totalIncome)).catch(console.error);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#cec4ff]">
      <Navigation isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar-horizontal">
          <Container fluid>
            {/* Stats Cards */}
            <Row className="gx-4 gy-4">
              {[
                { count: doctorCount, label: "Doctors Count", icon: "doctor.png" },
                { count: patientCount, label: "Patients Count", icon: "patient.png" },
                { count: medicineCount, label: "Medicine", icon: "medicine.png" },
                { count: appointmentCount, label: "Appointments", icon: "appointments.png" },
                { count: totalIncome, label: "Income", icon: "income.png" },
              ].map((card, i) => (
                <Col xs={12} sm={6} md={4} lg={2.4} key={i}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.2 }}
                  >
                    <Card className="h-100 shadow-lg border-3 border-amber-400 rounded-xl"
                      style={{ minHeight: "150px", backgroundColor: "#8854d0" }}>
                      <Card.Body className="d-flex align-items-center p-3">
                        <img src={`/src/icons/${card.icon}`} className="me-3" style={{ width: 60, height: 60 }} />
                        <div>
                          <h5 className="text-white font-bold text-xl mb-1">{card.count}</h5>
                          <small className="text-white font-bold" style={{ fontSize: "16px" }}>
                            {card.label}
                          </small>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>

            <br /><br />

            {/* Charts */}
            <Row>
              <Col md={6}>
                <animated.div style={springProps}>
                  <Card style={{ height: 430 }}>
                    <div className="card-header font-bold">Monthly Income Analytics</div>
                    <Card.Body>
                      <LineChart width={640} height={320} data={incomeData}
                        margin={{ top: 12, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="target" stroke="#82ca9d" />
                      </LineChart>
                    </Card.Body>
                  </Card>
                </animated.div>
              </Col>

              <Col md={6}>
                <animated.div style={springProps}>
                  <Card style={{ height: 430, backgroundColor: "#d1d8e0" }}>
                    <Card.Body style={{ maxHeight: "430px", overflowY: "auto" }}>
                      {doctorsData.map((doctor, i) => (
                        <motion.div
                          key={doctor.id}
                          className="d-flex align-items-center mb-3 border-bottom pb-2"
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          whileTap={{ scale: 1.1 }}
                        >
                          <img
                            src={`/src/images/${doctor.img}`}
                            className="me-3 rounded-circle"
                            style={{ width: 60, height: 60, objectFit: "cover", border: "2px solid #8884d8" }}
                          />
                          <div>
                            <h6 className="font-bold">{doctor.name}</h6>
                            <small className="text-muted">{doctor.specialty}</small>
                          </div>
                        </motion.div>
                      ))}
                    </Card.Body>
                  </Card>
                </animated.div>
              </Col>
            </Row>
          </Container>
        </main>
      </div>
    </div>
  );
}