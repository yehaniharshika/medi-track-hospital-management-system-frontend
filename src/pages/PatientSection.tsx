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
import {Patient} from "../models/Patient.ts";
import {deletePatient, getPatients, savePatient, updatePatient} from "../reducers/PatientSlice.ts";
import Swal from "sweetalert2";

const PatientSection = () => {

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [patientId, setPatientId] = useState("");
    const [patientName, setPatientName] = useState("");
    const [age,setAge] = useState("");
    const [addressLine1,setAddressLine1] = useState("");
    const [addressLine2,setAddressLine2] = useState("");
    const [postalCode,setPostalCode] = useState("");
    const [gender, setGender] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [blood_type, setBlood_type] = useState("");
    const [chronic_diseases, setChronic_diseases] = useState("");
    const [last_visit_date, setLast_visit_date] = useState("");
    const dispatch = useDispatch<AppDispatch>();

    const patients = useSelector((state: RootState) => state.patients);
    const [patientImg, setPatientImg] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);


    const validatePatientName = (name: string) => {
        if (!/^[A-Za-z\s]{3,}$/.test(name)) {
            Swal.fire({
                title: "❌ Error!",
                html: '<p class="swal-text">Invalid patient name! It must contain at least 3 letters.</p>',
                icon: "error",
                confirmButtonText: "OK",
                background: "white",
                color: "black",
                confirmButtonColor: "red",
                timer: 3000,
                width: "450px",
                customClass: {
                    title: "swal-title",
                    popup: "swal-popup",
                    confirmButton: "swal-button",
                }
            });
            return false;
        }
        return true;
    };

    const validateContactNumber = (phone: string) => {
        if (!/^(?:\+94|0)(7\d{8})$/.test(phone)) {
            Swal.fire({
                title: "❌ Error!",
                html: '<p class="swal-text">Invalid phone number! Please enter a valid Sri Lankan phone number.</p>',
                icon: "error",
                confirmButtonText: "OK",
                background: "white",
                color: "black",
                confirmButtonColor: "red",
                timer: 3000,
                width: "450px",
                customClass: {
                    title: "swal-title",
                    popup: "swal-popup",
                    confirmButton: "swal-button",
                }
            });
            return false;
        }
        return true;
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPatientImg(file);

            // For image preview
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result as string); // Store Base64 for preview
            };
            reader.readAsDataURL(file);
        }
    };

    const generateNextPatientId = (existingPatients: Patient[]) => {
        if (!existingPatients || existingPatients.length === 0) {
            return 'P001';
        }

        const patientsIds = existingPatients
            .map(p => p.patientId ? Number(p.patientId.replace('P', '')) : 0)
            .filter(num => !isNaN(num));

        if (patientsIds.length === 0) {
            return 'P001';
        }

        const maxId = Math.max(...patientsIds);
        const nextPatientId = `P${String(maxId + 1).padStart(3, '0')}`;
        return nextPatientId;
    };


    useEffect(() => {
        dispatch(getPatients());
    }, [dispatch]);

    useEffect(() => {
        if (patients && patients.length > 0) {
            const nextPatientId = generateNextPatientId(patients);
            setPatientId(nextPatientId); // Automatically set the generated ID
        }
    }, [patients]);

    const handleEditPatient = (patient: Patient) => {
        setPatientId(patient.patientId);
        setPatientName(patient.patientName);
        setAge(patient.age);
        setPreviewImage(patient.patientImg ? `data:image/jpeg;base64,${patient.patientImg}` : null); // Ensure correct format
        setPatientImg(null); // Reset file selection
        setAddressLine1(patient.addressLine1);
        setAddressLine2(patient.addressLine2);
        setPostalCode(patient.postalCode);
        setGender(patient.gender);
        setContactNumber(patient.contactNumber);
        setBlood_type(patient.blood_type);
        setChronic_diseases(patient.chronic_diseases);
        setLast_visit_date(patient.last_visit_date);
        setShow(true);
    };


    const resetForm = () => {
        setPatientId('');
        setPatientName('');
        setAge('');
        setPatientImg(null);
        setPreviewImage(null);
        setAddressLine1('');
        setAddressLine2('');
        setPostalCode('');
        setGender('');
        setContactNumber('');
        setBlood_type('');
        setChronic_diseases('');
        setLast_visit_date('');

        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleAddPatient = () => {
        if (!validatePatientName(patientName)) {
            return;
        }

        if (!validateContactNumber(contactNumber)) {
            return;
        }

        const formData = new FormData();
        formData.append("patientId", patientId);
        formData.append("patientName", patientName);
        formData.append("age", age);
        formData.append("addressLine1", addressLine1);
        formData.append("addressLine2", addressLine2);
        formData.append("postalCode", postalCode);
        formData.append("gender", gender);
        formData.append("contactNumber", contactNumber);
        formData.append("blood_type", blood_type);
        formData.append("chronic_diseases", chronic_diseases);
        formData.append("last_visit_date", last_visit_date);

        if (patientImg) {
            formData.append("patientImg", patientImg);
        }

        dispatch(savePatient(formData)).then(() => {
            dispatch(getPatients());
        });

        resetForm();
        setPatientId(generateNextPatientId(patients));
        handleClose();
    };


    const handleUpdatePatient = () => {
        if (!validatePatientName(patientName)) {
            return;
        }

        if (!validateContactNumber(contactNumber)) {
            return;
        }

        const formData = new FormData();
        formData.append("patientId", patientId);
        formData.append("patientName", patientName);
        formData.append("age", age);
        formData.append("addressLine1", addressLine1);
        formData.append("addressLine2", addressLine2);
        formData.append("postalCode", postalCode);
        formData.append("gender", gender);
        formData.append("contactNumber", contactNumber);
        formData.append("blood_type", blood_type);
        formData.append("chronic_diseases", chronic_diseases);
        formData.append("last_visit_date", last_visit_date);

        if (patientImg) {
            formData.append("patientImg", patientImg); // assuming patientImg is a file
        }

        dispatch(updatePatient(formData)).then(() => {
            dispatch(getPatients());
        });
        resetForm();
        setPatientId(generateNextPatientId(patients));
        handleClose();
    };

    const handleDeletePatient = (event: React.MouseEvent<HTMLButtonElement>, patientId: string) => {
        event.stopPropagation();
        dispatch(deletePatient(patientId));
    };


    return (
        <>
            <div className="flex overflow-hidden bg-emerald-200">
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
                                            <motion.h4 className="font-bold text-2xl text-neutral-100"
                                                       style={{fontFamily: "'Ubuntu', sans-serif", fontWeight: "bold",color: "white"}}
                                                initial={{scale: 0.8, opacity: 0}}
                                                animate={{scale: 1, opacity: 1}}
                                                transition={{
                                                    delay: 0.2,
                                                    duration: 0.6,
                                                    ease: "easeOut",
                                                }}
                                            >
                                                Patient Management
                                            </motion.h4>
                                        </Row>
                                    </Container>
                                </motion.div>
                            </Col>
                        </Row>
                        <br/>
                        <div className="flex justify-between items-center mb-4">

                            <Button variant="primary" onClick={handleShow} className="h-10 max-w-40 font-bold" style={{ fontFamily: "'Montserrat', serif" ,fontSize: "15px",fontWeight: "bold"}}>
                                + Add Patient
                            </Button>

                            <div className="w-1/3">
                                <InputGroup>
                                    <FormControl className="border-2 border-black" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px"}} placeholder="Search Patient..."/>
                                    <InputGroup.Text className="cursor-pointer border-2 border-black">
                                        <MdSearch/>
                                    </InputGroup.Text>
                                </InputGroup>
                            </div>
                        </div>
                        <Modal show={show} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title className="font-bold" style={{fontFamily: "'Montserrat', serif",fontWeight:"600"}}>Patient Details Form</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{backgroundColor:"#cec4ff"}}>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Patient ID</Form.Label>
                                        <Form.Control className="border-2 border-black" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px",fontWeight: "550" , color: "darkblue"}} type="text"
                                                      value={patientId} onChange={e => setPatientId(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Full Name</Form.Label>
                                        <Form.Control className="border-2 border-black font-normal" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px",}} type="text" value={patientName} placeholder="Enter full name" onChange={e => setPatientName(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Age</Form.Label>
                                        <Form.Control className="border-2 border-black font-normal" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px",}} type="number" value={age} placeholder="Enter Age" onChange={e => setAge(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Image</Form.Label>
                                        <div className="image-box">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview"/>
                                            ) : (
                                                <div className="text-center text-muted font-bold" style={{ fontFamily: "'Montserrat', serif", fontSize: "15px"}}>No Image Selected</div>
                                            )}
                                        </div>
                                        <Button className="choose-image-btn" as="label">
                                            Choose Image
                                            <input type="file" id="file-input" accept="image/*" onChange={handleImageUpload} hidden />
                                        </Button>
                                    </Form.Group>

                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group controlId="address-line-03">
                                                <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Address Line 03(B.NO/Lane)</Form.Label>
                                                <Form.Control className="border-2 border-black" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} type="text" placeholder="Enter B.No/Lane" value={addressLine1} onChange={e => setAddressLine1(e.target.value)}/>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group controlId="address-line-04">
                                                <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Address Line 02(City)</Form.Label>
                                                <Form.Control className="border-2 border-black" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} placeholder="Enter City" value={addressLine2} onChange={e => setAddressLine2(e.target.value)}  type="text"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3" controlId="postal-code">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Postal code</Form.Label>
                                        <Form.Control className="border-2 border-black" placeholder="Enter Postal Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}}  type="text"/>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="gender">
                                        <Form.Label className="font-bold" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px"}}>Gender</Form.Label>
                                        <Form.Select className="border-2 border-black" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} value={gender} onChange={e => setGender(e.target.value)}>
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Contact Number
                                        </Form.Label>
                                        <Form.Control placeholder="Enter Contact Number" className="border-2 border-black" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px"}} type="text" value={contactNumber}
                                                      onChange={e => setContactNumber(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="gender">
                                        <Form.Label className="font-bold" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px"}}>Blood Type</Form.Label>
                                        <Form.Select className="border-2 border-black" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} value={blood_type} onChange={e => setBlood_type(e.target.value)}>
                                            <option value="">Select Blood type</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>
                                            Chronic Diseases</Form.Label>
                                        <Form.Control placeholder="Enter Chronic Diseases"
                                                      className="border-2 border-black"
                                                      style={{ fontFamily: "'Montserrat', serif" ,
                                                          fontSize: "15px"}} type="text"
                                                      value={chronic_diseases} onChange={e => setChronic_diseases(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Last visit date</Form.Label>
                                        <Form.Control className="border-2 border-black font-normal" style={{ fontFamily: "'Montserrat', serif" ,
                                            fontSize: "15px"}}  type="date" value={last_visit_date} onChange={e => setLast_visit_date(e.target.value)}/>
                                    </Form.Group>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button style={{ fontFamily: "'Montserrat', serif" ,
                                    fontSize: "15px" , fontWeight: "600"}} className="font-bold" variant="primary" onClick={handleAddPatient}>Save</Button>
                                <Button  style={{ fontFamily: "'Montserrat', serif" ,
                                    fontSize: "15px" , fontWeight: "600"}} className="font-bold" variant="success" onClick={handleUpdatePatient}>Update</Button>
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
                                        <th className="px-4 py-2 border">Patient ID</th>
                                        <th className="px-4 py-2 border">Full Name</th>
                                        <th className="px-4 py-2 border">Age</th>
                                        <th className="px-4 py-2 border">Profile pic</th>
                                        <th className="px-4 py-2 border">Address Line01</th>
                                        <th className="px-4 py-2 border">Address Line02</th>
                                        <th className="px-4 py-2 border">Postal code</th>
                                        <th className="px-4 py-2 border">Gender</th>
                                        <th className="px-4 py-2 border">Phone</th>
                                        <th className="px-4 py-2 border">B. type</th>
                                        <th className="px-4 py-2 border">Chronic Diseases</th>
                                        <th className="px-4 py-2 border">L. visit date</th>
                                        <th className="px-4 py-2 border">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody style={{ fontFamily: "'Montserrat', serif" , fontSize: "14px",fontWeight: "400"}}>
                                    {patients.map((patient) => (
                                        <tr key={patient.patientId} onClick={() => handleEditPatient(patient)}
                                            className="hover:bg-blue-100 transition-all">
                                            <td className="px-4 py-2 border">{patient.patientId}</td>
                                            <td className="px-4 py-2 border">{patient.patientName}</td>
                                            <td className="px-4 py-2 border">{patient.age}</td>
                                            <td className="px-4 py-2 border">
                                                {patient.patientImg ? (
                                                    <img src={`data:image/jpeg;base64,${patient.patientImg}`}
                                                         alt="Patient Image"
                                                         className="w-[60px] h-[60px] object-cover rounded-full"/>
                                                ) : (
                                                    <span>No Image</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border">{patient.addressLine1}</td>
                                            <td className="px-4 py-2 border">{patient.addressLine2}</td>
                                            <td className="px-4 py-2 border">{patient.postalCode}</td>
                                            <td className="px-4 py-2 border">{patient.gender}</td>
                                            <td className="px-4 py-2 border">{patient.contactNumber}</td>
                                            <td className="px-4 py-2 border">{patient.blood_type}</td>
                                            <td className="px-4 py-2 border">{patient.chronic_diseases}</td>
                                            <td className="px-4 py-2 border">{patient.last_visit_date}</td>
                                            <td className="px-4 py-2 border flex justify-center gap-2 h-[80px]">
                                                <button
                                                    className="bg-red-500 text-white px-3 h-[40px] py-1 rounded-md hover:bg-red-700"
                                                    onClick={(event) => handleDeletePatient(event, patient.patientId)}>Delete
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

export default PatientSection;
