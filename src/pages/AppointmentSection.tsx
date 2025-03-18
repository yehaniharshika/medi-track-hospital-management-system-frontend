import {Navigation} from "../components/Navigation.tsx";
import {Container, FormControl, InputGroup, Modal} from "react-bootstrap";
import {Col, Form, Row, Table} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {motion} from "framer-motion";
import {useEffect, useState} from "react";
import "../pages/style/doctor.css";
import {MdSearch} from "react-icons/md";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../store/Store.ts";
import {Appointment} from "../models/Appointment.ts";
import {deleteAppointment, getAppointments, saveAppointment, updateAppointment} from "../reducers/AppointmentSlice.ts";
import {SlCalender} from "react-icons/sl";
// npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from '@fullcalendar/core';
import "../pages/style/calendar.css";

const AppointmentSection = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [appointmentCode, setAppointmentCode] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");
    const [patientId, setPatientId] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [patientIds, setPatientIds] = useState<string[]>([]);
    const [doctorIds,setDoctorIds] = useState<string[]>([]);
    const [patientName, setPatientName] = useState("");
    const [patientTel, setPatientTel] = useState("");
    const [age, setAge] = useState("");
    const [doctorName, setDoctorName] = useState("");
    const [doctorTel, setDoctorTel] = useState("");
    const [appointmentType, setAppointmentType] = useState("");
    const [appointmentStatus, setAppointmentStatus] = useState("");
    const dispatch = useDispatch<AppDispatch>();

    const appointments = useSelector((state: RootState) => state.appointments);
    const patients = useSelector((state: RootState) => state.patients);
    const doctors = useSelector((state: RootState) => state.doctors);

    const [calendarShow, setCalendarShow] = useState<boolean>(false);
    const handleCalendarShow = () => setCalendarShow(true);
    const handleCalendarClose = () => setCalendarShow(false);



    const generateNextAppointmentCode = (existingAppointments : Appointment[]) => {
        if (!existingAppointments || existingAppointments.length === 0) {
            return 'AC001';
        }

        const appointmentCodes = existingAppointments
            .map(app => app.appointmentCode ? Number(app.appointmentCode.replace('AC', '')) : 0)
            .filter(num => !isNaN(num));

        if (appointmentCodes.length === 0) {
            return 'AC001';
        }

        const maxId = Math.max(...appointmentCodes);
        return `AC${String(maxId + 1).padStart(3, '0')}`;
    };

    useEffect(() => {
        // Load Patient IDs
        const patientIdArray = patients.map((p) => p.patientId);
        setPatientIds(patientIdArray);

        // Set Selected Patient Details
        const selectedPatient = patients.find(p => p.patientId === patientId);
        setPatientName(selectedPatient ? selectedPatient.patientName : '');
        setAge(selectedPatient ? selectedPatient.age : '');
        setPatientTel(selectedPatient ? selectedPatient.contactNumber : '');

        // Load Doctor IDs
        const doctorIdArray = doctors.map((doc) => doc.doctorId);
        setDoctorIds(doctorIdArray);

        // Update Selected Doctor Details
        const selectedDoctor = doctors.find(doc => doc.doctorId === doctorId);
        setDoctorName(selectedDoctor ? selectedDoctor.doctorName : '');
        setDoctorTel(selectedDoctor ? selectedDoctor.contactNumber : '');

        // Fetch Medical Reports and Generate ID
        dispatch(getAppointments()).then((response) => {
            const nextAppointmentCode = generateNextAppointmentCode(response.payload);
            setAppointmentCode(nextAppointmentCode); // Automatically set the generated Appointment Code
        });

    }, [patients, patientId, doctors, doctorId, dispatch]);

    useEffect(() => {
        dispatch(getAppointments());
    }, [dispatch]);


    const handleEditAppointment = (appointment: Appointment) => {
        setAppointmentCode(appointment.appointmentCode);
        setAppointmentDate(appointment.appointmentDate);
        setAppointmentTime(appointment.appointmentTime);
        setPatientId(appointment.patientId);
        setDoctorId(appointment.doctorId);
        setAppointmentType(appointment.appointmentType);
        setAppointmentStatus(appointment.appointmentStatus);
        setShow(true);
    };

    const resetForm = () => {
        setAppointmentCode('');
        setAppointmentDate('');
        setAppointmentTime('');
        setPatientId('');
        setDoctorId('');
        setAppointmentType('');
        setAppointmentStatus('');
    };


    const handleAddAppointment = () => {
        if (!appointmentCode || !appointmentDate || !appointmentTime || !patientId || !doctorId || !appointmentType ||!appointmentStatus) {
            alert("All fields are required!");
            return;
        }

        const newAppointment = {appointmentCode,appointmentDate,appointmentTime,patientId,doctorId,appointmentType,appointmentStatus};
        dispatch(saveAppointment(newAppointment)).then(() => {
            dispatch(getAppointments());
        });
        resetForm();
        setAppointmentCode(generateNextAppointmentCode(appointments))
        handleClose();
    }


    const handleUpdateAppointment = () => {
        if (!appointmentCode || !appointmentDate || !appointmentTime || !patientId || !doctorId || !appointmentType ||!appointmentStatus) {
            alert("All fields are required!");
            return;
        }

        const updatedAppointment = {appointmentCode,appointmentDate,appointmentTime,patientId,doctorId,appointmentType,appointmentStatus};
        dispatch(updateAppointment(updatedAppointment)).then(() => {
            dispatch(getAppointments());
        });
        resetForm();
        setAppointmentCode(generateNextAppointmentCode(appointments))
        handleClose();
    }


    const handleDeleteAppointment = (event: React.MouseEvent<HTMLButtonElement>, appointmentCode: string) => {
        event.stopPropagation();
        dispatch(deleteAppointment(appointmentCode));

    };

    const events: EventInput[] = appointments.map((appointment: Appointment) => ({
        title: `Patient: ${appointment.patientId} | Time: ${appointment.appointmentTime}`,
        start: `${appointment.appointmentDate}T${appointment.appointmentTime}`,
        end: `${appointment.appointmentDate}T${appointment.appointmentTime}`,
    }));


    return (
        <>
            <div className="flex overflow-hidden ">
                <Navigation/>
                <div className="flex-1 p-5" style={{backgroundColor: "#cec4ff"}}>
                    <Container fluid>
                        <Row className="align-items-center mb-3">
                            <Col md={12}>
                                <motion.div
                                    className="p-3 rounded top-50"
                                    style={{backgroundColor: "#8854d0"}}
                                    initial={{opacity: 0, y: -50}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.8, ease: "easeOut"}}
                                    whileHover={{
                                        scale: 1.02,
                                        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
                                    }}
                                >
                                    <Container fluid>
                                        <Row className="align-items-center">
                                            <motion.h4
                                                className="font-bold text-2xl text-neutral-100"
                                                style={{fontFamily: "'Ubuntu', sans-serif",
                                                    fontWeight: "bold",color: "white"}}
                                                initial={{scale: 0.8, opacity: 0}}
                                                animate={{scale: 1, opacity: 1}}
                                                transition={{
                                                    delay: 0.2,
                                                    duration: 0.6,
                                                    ease: "easeOut",
                                                }}
                                            >
                                                Appointment Management
                                            </motion.h4>
                                        </Row>
                                    </Container>
                                </motion.div>
                            </Col>
                        </Row>
                        <br/>
                        <div className="flex justify-between items-center mb-4">

                            <Button variant="primary" onClick={handleShow} className="h-10 max-w-40 font-bold" style={{ fontFamily: "'Montserrat', serif" ,fontSize: "15px",fontWeight: "bold"}}>
                                + Appointment
                            </Button>

                            <div className="w-1/3">
                                <InputGroup>
                                    <FormControl
                                        className="border-2 border-black"
                                        style={{ fontFamily: "'Montserrat', serif", fontSize: "15px" }}
                                        placeholder="Search Appointment..."
                                    />
                                    <InputGroup.Text className="cursor-pointer border-2 border-black">
                                        <MdSearch/>
                                    </InputGroup.Text>

                                    {/* Adding padding between the search input and the calendar button */}
                                    <div
                                        className="ms-2"> {/* 'ms-2' adds margin to the left (padding between the input and calendar button) */}
                                        <Button onClick={handleCalendarShow}
                                                className="p-2"> {/* Add padding inside the button if needed */}
                                            <SlCalender size={24}/>
                                        </Button>
                                    </div>
                                </InputGroup>
                            </div>

                        </div>
                        <Modal show={calendarShow} onHide={handleCalendarClose} className="custom-modal-size">
                        <Modal.Header closeButton>
                                <Modal.Title>Appointments Calendar</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{ fontFamily: "'Montserrat', serif", fontWeight: "bold" ,fontSize: "14px"}}>
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: "prev,next today",
                                        center: "title",
                                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                                    }}
                                    events={events}
                                    selectable={true}
                                    editable={false}
                                />
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCalendarClose} style={{ fontFamily: "'Montserrat', serif" ,fontSize: "14px"}}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Modal>


                        <Modal show={show} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title className="font-bold" style={{fontFamily: "'Montserrat', serif",fontWeight:"600"}}>Appointment Details Form</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{backgroundColor:"#cec4ff"}}>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Appointment Code</Form.Label>
                                        <Form.Control className="border-2 border-black"
                                                      style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px" , fontWeight: "550" , color: "darkblue"}} type="text" value={appointmentCode}
                                                      onChange={e => setAppointmentCode(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Appointment Date</Form.Label>
                                        <Form.Control className="border-2 border-black font-normal" style={{
                                            fontFamily: "'Montserrat', serif",
                                            fontSize: "15px"
                                        }} type="date" value={appointmentDate}
                                                      onChange={e => setAppointmentDate(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Appointment Time</Form.Label>
                                        <Form.Control placeholder="00:00:00" className="border-2 border-black font-normal" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} type="time" value={appointmentTime}
                                                      onChange={e => setAppointmentTime(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Patient Id</Form.Label>
                                        <Form.Select style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} className="border-2 border-black" aria-label="Default select example" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                                            <option value="">Select Patient Id</option>
                                            {patientIds.map((pid) => (
                                                <option key={pid} value={pid}>
                                                    {pid}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group controlId="staff-id">
                                                <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>patient Full Name</Form.Label>
                                                <Form.Control className="border-2 border-black"  style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} type="text" value={patientName} readOnly/>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group controlId="firstName">
                                                <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Contact Number</Form.Label>
                                                <Form.Control className="border-2 border-black"  style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} type="text" value={patientTel} readOnly/>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group controlId="firstName">
                                                <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Age</Form.Label>
                                                <Form.Control className="border-2 border-black"  style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} type="text" value={age} readOnly/>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>
                                            Doctor Id
                                        </Form.Label>
                                        <Form.Select className="border-2 border-black" aria-label="Default select example" value={doctorId} style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} onChange={(e) => setDoctorId(e.target.value)}>
                                            <option value="">Select Doctor Id</option>
                                            {doctorIds.map((did) => (
                                                <option key={did} value={did}>
                                                    {did}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group controlId="staff-id">
                                                <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Doctor Name</Form.Label>
                                                <Form.Control className="border-2 border-black"  style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} type="text" value={doctorName} readOnly/>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group controlId="firstName">
                                                <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Contact Number</Form.Label>
                                                <Form.Control className="border-2 border-black"  style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} type="text" value={doctorTel} readOnly/>
                                            </Form.Group>
                                        </Col>
                                    </Row>


                                    <Form.Group className="mb-3" controlId="gender">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}}>Appointment Type</Form.Label>
                                        <Form.Select className="border-2 border-black"
                                                     style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}}
                                                     value={appointmentType}
                                                     onChange={e => setAppointmentType(e.target.value)}>
                                            <option value="">Select appointment type</option>
                                            <option value="General Checkup">General Checkup</option>
                                            <option value="Follow-up">Follow-up</option>
                                            <option value="Emergency">Emergency</option>
                                            <option value="Consultation">Consultation</option>
                                            <option value="Vaccination ">Vaccination</option>
                                            <option value="Diagnostic Test">Diagnostic Test</option>
                                            <option value="Physical Therapy">Physical Therapy</option>
                                            <option value="Mental Health Counseling">Mental Health Counseling</option>
                                            <option value="Prenatal Checkup">Prenatal Checkup</option>
                                            <option value="Other">Other</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="gender">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}}>Appointment Status</Form.Label>
                                        <Form.Select className="border-2 border-black"
                                                     style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}}
                                                     value={appointmentStatus}
                                                     onChange={e => setAppointmentStatus(e.target.value)}>
                                            <option value="">Select appointment status</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <br/>

                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button style={{ fontFamily: "'Montserrat', serif" ,
                                    fontSize: "15px" , fontWeight: "600"}} className="font-bold" variant="primary" onClick={handleAddAppointment}>Save</Button>
                                <Button  style={{ fontFamily: "'Montserrat', serif" ,
                                    fontSize: "15px" , fontWeight: "600"}} className="font-bold" variant="success" onClick={handleUpdateAppointment}>Update</Button>
                                <Button  style={{ fontFamily: "'Montserrat', serif" ,
                                    fontSize: "15px" , fontWeight: "600"}} className="font-bold" variant="secondary" onClick={handleClose}>Close</Button>
                            </Modal.Footer>
                        </Modal>
                        <br/>
                        <div className="overflow-x-auto overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-md">
                            <div className="overflow-x-auto">
                                <Table striped bordered hover responsive
                                       className="w-full text-center border border-gray-300" >
                                    <thead className="bg-red-500 text-white">
                                    <tr className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>
                                        <th className="px-4 py-2 border">Appointment Code</th>
                                        <th className="px-4 py-2 border">Date</th>
                                        <th className="px-4 py-2 border">Time</th>
                                        <th className="px-4 py-2 border">Doctor Id</th>
                                        <th className="px-4 py-2 border">Patient Id</th>
                                        <th className="px-4 py-2 border">Appointment type</th>
                                        <th className="px-4 py-2 border">Status</th>
                                        <th className="px-4 py-2 border">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody style={{ fontFamily: "'Montserrat', serif" , fontSize: "14px",fontWeight: "400"}}>
                                    {appointments.map((appointment) => (
                                        <tr key={appointment.appointmentCode} onClick={() => handleEditAppointment(appointment)}
                                            className="hover:bg-blue-100 transition-all">
                                            <td className="px-4 py-2 border">{appointment.appointmentCode}</td>
                                            <td className="px-4 py-2 border">{appointment.appointmentDate}</td>
                                            <td className="px-4 py-2 border">{appointment.appointmentTime}</td>
                                            <td className="px-4 py-2 border">{appointment.patientId}</td>
                                            <td className="px-4 py-2 border">{appointment.doctorId}</td>
                                            <td className="px-4 py-2 border">{appointment.appointmentType}</td>
                                            <td className="px-4 py-2 border">{appointment.appointmentStatus}</td>
                                            <td className="px-4 py-2 border flex justify-center gap-2 h-[80px]">
                                                <button
                                                    className="bg-red-500 text-white px-3 h-[40px] py-1 rounded-md hover:bg-red-700"
                                                    onClick={(event) => handleDeleteAppointment(event, appointment.appointmentCode)}>Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </Container>
                </div>
            </div>
        </>
    );
};

export default AppointmentSection;
