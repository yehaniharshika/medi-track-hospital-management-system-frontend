import {Navigation} from "../components/Navigation.tsx";
import {Card, Col, Container, FormControl, InputGroup, Row} from "react-bootstrap";
import {MdSearch} from "react-icons/md";
import {SiGooglemessages} from "react-icons/si";
import {IoNotificationsCircleOutline} from "react-icons/io5";
import { motion } from "motion/react";
import { useSpring, animated } from "@react-spring/web";
import {CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";
import {useEffect, useState} from "react";
import axios from "axios";


export default function Dashboard() {
    const [patientCount, setPatientCount] = useState(0);
    const [doctorCount, setDoctorCount] = useState(0);
    const [medicineCount, setMedicineCount] = useState(0);
    const [appointmentCount, setAppointmentCount] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);

    const incomeData = [
        { name: "Jan", income: 5000, target: 5500 },
        { name: "Feb", income: 6200, target: 6000 },
        { name: "Mar", income: 7200, target: 7500 },
        { name: "Apr", income: 8500, target: 8200 },
        { name: "May", income: 9200, target: 9500 },
        { name: "Jun", income: 9800, target: 10000 },
        { name: "Jul", income: 10500, target: 11000 },
        { name: "Aug", income: 10200, target: 10800 },
        { name: "Sep", income: 8900, target: 9700 },
        { name: "Oct", income: 9600, target: 11000 },
        { name: "Nov", income: 11200, target: 12000 },
        { name: "Dec", income: 12500, target: 13000 },
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


    const springProps = useSpring({
        opacity: 1,
        from: { opacity: 0 },
        config: { tension: 220, friction: 20 },
    });

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date()); // Update time every second
        }, 1000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const formattedTime = currentTime.toLocaleTimeString(); // Format time
    const formattedDate = currentTime.toLocaleDateString(); // Format date


    useEffect(() => {
        axios.get("http://localhost:3003/patient/patient-count", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}` // Add token if required
            }
        })
            .then(response => {
                setPatientCount(response.data); // Assuming API returns just the number
            })
            .catch(error => {
                console.error("Error fetching patient count:", error);
            });


        // doctor count
        axios.get("http://localhost:3003/doctor/doctor-count", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}` // Add token if required
            }
        })
            .then(response => {
                setDoctorCount(response.data); // Assuming API returns just the number
            })
            .catch(error => {
                console.error("Error fetching doctor count:", error);
            });


        // medicine count
        axios.get("http://localhost:3003/medicine/medicine-count", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}` // Add token if required
            }
        })
            .then(response => {
                setMedicineCount(response.data);
            })
            .catch(error => {
                console.error("Error fetching medicine count:", error);
            });


        // appointment count
        axios.get("http://localhost:3003/appointment/appointment-count", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}` // Add token if required
            }
        })
            .then(response => {
                setAppointmentCount(response.data);
            })
            .catch(error => {
                console.error("Error fetching appointment count:", error);
            });

        axios.get("http://localhost:3003/payment/total-income", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}` // Add token if required
            }
        })
            .then(response => {
                setTotalIncome(response.data.totalIncome);
            })
            .catch(error => {
                console.error("Error fetching income:", error);
            });

    }, []);

    return (
        <div className="flex w-full h-full overflow-hidden">
            {/* Navigation Sidebar */}
            <Navigation/>

            {/* Main Content Area */}
            <div className="flex-1 p-5" style={{backgroundColor: "#cec4ff"}}>
                <Container fluid>
                    <Row className="align-items-center mb-3">
                        <Col md={12}>
                            <div className="p-3 rounded top-50" style={{backgroundColor: "#8854d0"}}>
                                <Container fluid>
                                    <Row className="align-items-center">
                                        {/* Search Field */}
                                        <Col md={6}>
                                            <InputGroup>
                                                <FormControl className="font-bold"
                                                             style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px"}}
                                                             placeholder="Search..."/>
                                                <InputGroup.Text>
                                                    <MdSearch/>
                                                </InputGroup.Text>
                                            </InputGroup>
                                        </Col>

                                        <Col md={6}>
                                            <div className="d-flex justify-content-end align-items-center gap-3">
                                                {/* Date & Time */}
                                                <div className="text-end">
                                                    <p className="m-0 text-white" style={{ fontFamily: "'Montserrat', serif",fontSize: "20px",fontWeight: "bold"}}>{formattedDate}</p>
                                                    <h6 className="text-white" style={{ fontFamily: "'Montserrat', serif"}}>{formattedTime}</h6>
                                                </div>

                                                {/* Icons */}
                                                <SiGooglemessages size={35}/>
                                                <IoNotificationsCircleOutline size={35} />
                                            </div>
                                        </Col>

                                    </Row>
                                </Container>
                            </div>
                        </Col>
                    </Row>

                    <br/><br/>
                    <Row className="gx-1 gy-1 justify-content-between"> {/* Reduced gutter spacing */}
                        {[
                            { id: "doctor", count: doctorCount, label: "Doctors Count", icon: "doctor.png" },
                            { id: "patient", count: patientCount, label: "Patients Count", icon: "patient.png" },
                            { id: "medicine", count: medicineCount, label: "Medicine", icon: "medicine.png" },
                            { id: "appointments", count: appointmentCount, label: "Appointments", icon: "appointments.png" },
                            { id: "income", count: totalIncome, label: "Income", icon: "income.png" },
                        ].map((card, index) => (
                            <Col xs={6} sm={4} md={3} lg={2} key={card.id}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                >
                                    <Card className="h-100 shadow-lg border-3 border-amber-400 rounded-xl"
                                          style={{ minHeight: "150px" ,
                                          minWidth: "280px",
                                          backgroundColor: "#8854d0",}}>
                                        <Card.Body className="d-flex align-items-center p-2">
                                            <img
                                                src={`/src/icons/${card.icon}`}
                                                alt={`${card.id}-icon`}
                                                className="me-3"
                                                style={{ width: 60, height: 60 }}
                                            />
                                            <div>
                                                <h5 className="text-white font-bold text-xl" style={{ fontFamily: "'Ubuntu', sans-serif" }}>{card.count}</h5>
                                                <small className="text-white font-bold"
                                                       style={{ fontFamily: "'Ubuntu', sans-serif" ,
                                                       fontSize: "18px"}}>
                                                    {card.label}
                                                </small>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                    <br/><br/>
                    <Row>
                        <Col md={6}>
                            <animated.div style={springProps}>
                                <Card style={{ height: 430}}>
                                    <div className="card-header font-bold" style={{ fontFamily: "'Ubuntu', sans-serif" }}>Monthly Income Analytics</div>
                                    <Card.Body className="">
                                        <LineChart
                                            width={640}
                                            height={320}
                                            data={incomeData}
                                            margin={{
                                                top: 12,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                            style={{ fontFamily: "'Ubuntu', sans-serif",
                                                fontWeight: "bold",
                                            }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="income"
                                                stroke="#8884d8"
                                                activeDot={{ r: 8 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="target"
                                                stroke="#82ca9d"
                                            />
                                        </LineChart>
                                    </Card.Body>
                                </Card>
                            </animated.div>
                        </Col>

                        <Col md={6}>
                            <animated.div style={springProps}>
                                <Card style={{ height: 430 ,
                                backgroundColor: "#d1d8e0"}}>
                                    <Card.Body style={{ maxHeight: "430px", overflowY: "auto" }}>
                                        {doctorsData.map((doctor, index) => (
                                            <motion.div
                                                key={doctor.id}
                                                className="d-flex align-items-center mb-3 border-bottom pb-2 doctor-card hover:bg-violet-400 hover:rounded-2xl"
                                                style={{ fontFamily: "'Ubuntu', sans-serif"}}
                                                initial={{ opacity: 0, x: -50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                whileTap={{ scale: 1.1 }}
                                            >
                                                <img
                                                    src={`/src/images/${doctor.img}`}
                                                    alt={doctor.name}
                                                    className="me-3 rounded-circle"
                                                    style={{
                                                        width: 60,
                                                        height: 60,
                                                        objectFit: "cover",
                                                        border: "2px solid #8884d8",
                                                    }}
                                                />
                                                <div key={`${doctor.id}-${index}`}>
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
                    <br/><br/>

                </Container>
            </div>
        </div>

    );
}
