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
import { deleteDoctor, getDoctors, saveDoctor, updateDoctor} from "../reducers/DoctorSlice.ts";
import {Doctor} from "../models/Doctor.ts";
import Swal from "sweetalert2";
import { Header } from "../components/Header.tsx";


const DoctorSection = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [doctorId, setDoctorId] = useState("");
    const [doctorName, setDoctorName] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [doctorImg, setDoctorImg] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [gender, setGender] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [email, setEmail] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [departmentIds, setDepartmentIds] = useState<string[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const doctors = useSelector((state : RootState) => state.doctors);
    const departments = useSelector((state: RootState) => state.departments);

    const validateEmail = (email: string) => {
        if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            Swal.fire({
                title: "❌ Error!",
                html: '<p class="swal-text">Invalid email! Please enter a valid email address.</p>',
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
            setDoctorImg(file);

            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result as string); // Store Base64 for preview
            };
            reader.readAsDataURL(file);
        }
    };

    const generateNextDoctorId = (existingDoctors: Doctor[]) => {
        if (!existingDoctors || existingDoctors.length === 0) {
            return 'DOC001';
        }

        const doctorIds = existingDoctors
            .map(d => d.doctorId ? Number(d.doctorId.replace('DOC', '')) : 0)
            .filter(num => !isNaN(num));

        if (doctorIds.length === 0) {
            return 'DOC001';
        }

        const maxId = Math.max(...doctorIds); // Get the highest numeric Id
        const nextDoctorId = `DOC${String(maxId + 1).padStart(3, '0')}`;
        return nextDoctorId;
    };


    useEffect(() => {
        dispatch(getDoctors());
    }, [dispatch]);

    useEffect(() => {
        const departmentIdArray = departments.map((dep) => dep.departmentId);
        setDepartmentIds(departmentIdArray);
    }, [departments]);

    useEffect(() => {
        dispatch(getDoctors()).then((response) => {
            const nextDoctorId = generateNextDoctorId(response.payload as Doctor[]);
            setDoctorId(nextDoctorId); //automatically set the generated ID
        });
    }, [dispatch]);


    const resetForm = () => {
        setDoctorId('');
        setDoctorName('');
        setSpecialty('');
        setDoctorImg(null);
        setPreviewImage(null);
        setGender('');
        setContactNumber('');
        setEmail('');
    };


    const handleEditDoctor = (doctor: Doctor) => {
        setDoctorId(doctor.doctorId);
        setDoctorName(doctor.doctorName);
        setSpecialty(doctor.specialty);
        setPreviewImage(doctor.doctorImg ? `data:image/jpeg;base64,${doctor.doctorImg}` : null);
        setDoctorImg(null);
        setGender(doctor.gender);
        setContactNumber(doctor.contactNumber);
        setEmail(doctor.email);
        setShow(true);
    };


    const handleAddDoctor = () => {
        if (!validateEmail(email)) {
            return;
        }

        if (!validateContactNumber(contactNumber)) {
            return;
        }

        const formData = new FormData();

        formData.append("doctorId", doctorId);
        formData.append("doctorName", doctorName);
        formData.append("specialty", specialty);
        formData.append("gender", gender);
        formData.append("contactNumber", contactNumber);
        formData.append("email", email);
        formData.append("departmentId", departmentId);

        if (doctorImg) {
            formData.append("doctorImg", doctorImg);
        }

        dispatch(saveDoctor(formData)).then(() => {
            dispatch(getDoctors());
        });

        resetForm();
        setDoctorId(generateNextDoctorId(doctors as Doctor[]));
        handleClose();
    };

    const handleUpdateDoctor = () => {
        if (!validateEmail(email)) {
            return;
        }

        if (!validateContactNumber(contactNumber)) {
            return;
        }

        const formData = new FormData();

        formData.append("doctorId", doctorId);
        formData.append("doctorName", doctorName);
        formData.append("specialty", specialty);
        formData.append("gender", gender);
        formData.append("contactNumber", contactNumber);
        formData.append("email", email);
        formData.append("departmentId", departmentId);

        if (doctorImg) {
            formData.append("doctorImg", doctorImg);
        }

        dispatch(updateDoctor(formData)).then(() => {
            dispatch(getDoctors());
        });
        resetForm();
        setDoctorId(generateNextDoctorId(doctors as Doctor[]));
        handleClose();
    }

    const handleDeleteDoctor = (event: React.MouseEvent<HTMLButtonElement>, doctorId: string) => {
        event.stopPropagation();
        dispatch(deleteDoctor(doctorId));
    };


    return (
        <>
            <div className="flex overflow-hidden bg-purple-500">
                <Navigation isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1" style={{backgroundColor: "#cec4ff"}}>
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <Container fluid>
                        
                        <div className="flex justify-between items-center mb-4 mt-5">
                            {/* Add Doctor Button */}
                            <Button
                                variant="primary"
                                onClick={handleShow}
                                className="h-10 max-w-40 font-bold"
                                style={{ fontFamily: "'Montserrat', serif" ,fontSize: "15px",fontWeight: "bold"}}
                            >
                                + Add Doctor
                            </Button>

                            <div className="w-1/3">
                                <InputGroup>
                                    <FormControl
                                        className="border-2 border-black"
                                        style={{ fontFamily: "'Montserrat', serif" ,
                                            fontSize: "15px"}}
                                        placeholder="Search Doctor..."
                                    />
                                    <InputGroup.Text className="cursor-pointer border-2 border-black">
                                        <MdSearch/>
                                    </InputGroup.Text>
                                </InputGroup>
                            </div>
                        </div>
                        <Modal show={show} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title className="font-bold" style={{fontFamily: "'Montserrat', serif",fontWeight:"600"}}>Doctor
                                    Details Form</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{backgroundColor:"#cec4ff"}}>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Doctor ID</Form.Label>
                                        <Form.Control className="border-2 border-black" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px",fontWeight: "550" , color: "darkblue"}}  type="text"
                                                      value={doctorId} onChange={e => setDoctorId(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>
                                            Department Id
                                        </Form.Label>
                                        <Form.Select style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} className="border-2 border-black" aria-label="Default select example" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                                            <option value="">Select Department Id</option>
                                            {departmentIds.map((depId) => (
                                                <option key={depId} value={depId}>
                                                    {depId}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Full Name</Form.Label>
                                        <Form.Control className="border-2 border-black font-normal" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px",}}
                                            type="text"
                                            value={doctorName}
                                            placeholder="Enter full name"
                                            onChange={e => setDoctorName(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{ fontFamily: "'Ubuntu', sans-serif" }}>Specialty</Form.Label>
                                        <Form.Select
                                            className="border-2 border-black"
                                            style={{ fontFamily: "'Montserrat', serif", fontSize: "15px" }}
                                            value={specialty}
                                            onChange={e => setSpecialty(e.target.value)}
                                        >
                                            <option value="">Select specialty</option>
                                            <option value="mbbs.(col),d. path md haematology">MBBS.(Col),D. Path MD Haematology</option>
                                            <option value="mbbs.(col),d. path md-cardiology">MBBS.(Col),D. Path MD Cardiology</option>
                                            <option value="mbbs.(col),d. path md-neurology">MBBS.(Col),D. Path MD Neurology</option>
                                            <option value="mbbs.(col),d. path md-dermatology">MBBS.(Col),D. Path MD Dermatology</option>
                                            <option value="mbbs.(col),d. path md-pediatrics">MBBS.(Col),D. Path MD Pediatrics</option>
                                            <option value="mbbs.(col),d. path md-psychiatry">MBBS.(Col),D. Path MD Psychiatry</option>
                                            <option value="mbbs.(col),d. path md-radiology">MBBS.(Col),D. Path MD Radiology</option>
                                            <option value="mbbs.(col),d. path md-anesthesiology">MBBS.(Col),D. Path MD Anesthesiology</option>
                                            <option value="mbbs.(col),d. path md-surgery">MBBS.(Col),D. Path MD Surgery</option>
                                            <option value="md-medicine">MD General Medicine</option>
                                            <option value="mbbs-md-cardiology">MBBS. MD Cardiology</option>
                                            <option value="mbbs-md-neurology">MBBS. MD Neurology</option>
                                            <option value="mbbs-md-dermatology">MBBS. MD Dermatology</option>
                                            <option value="mbbs-md-pediatrics">MBBS. MD Pediatrics</option>
                                            <option value="mbbs-md-psychiatry">MBBS. MD Psychiatry</option>
                                            <option value="mbbs-md-radiology">MBBS. MD Radiology</option>
                                            <option value="mbbs-md-surgery">MBBS. MD Surgery</option>
                                            <option value="mbbs-md-medicine">MBBS. MD General Medicine</option>
                                            <option value="mbbs-md-haematology">MBBS. MD Haematology</option>
                                            <option value="mbbs-mrcp">MBBS. MRCP</option>
                                            <option value="mbbs-frcs">MBBS. FRCS</option>
                                            <option value="mbbs-dch">MBBS. DCH</option>
                                            <option value="mbbs-dgo">MBBS. DGO</option>
                                            <option value="mbbs-dlo">MBBS. DLO</option>
                                            <option value="mbbs-d-ortho">MBBS. D. Ortho</option>
                                        </Form.Select>
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
                                            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                                        </Button>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="gender">
                                        <Form.Label className="font-bold"
                                                    style={{ fontFamily: "'Montserrat', serif" ,
                                                        fontSize: "15px"}}>Gender</Form.Label>
                                        <Form.Select className="border-2 border-black"
                                                     style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}}
                                                     value={gender} onChange={e => setGender(e.target.value)}>
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Contact Number
                                            </Form.Label>
                                        <Form.Control placeholder="Enter Contact Number"
                                                      className="border-2 border-black"
                                                      style={{ fontFamily: "'Montserrat', serif" ,
                                                          fontSize: "15px"}} type="text"
                                                      value={contactNumber}
                                                      onChange={e => setContactNumber(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>
                                            Email</Form.Label>
                                        <Form.Control placeholder="Enter Email"
                                                      className="border-2 border-black"
                                                      style={{ fontFamily: "'Montserrat', serif" ,
                                                          fontSize: "15px"}} type="text"
                                                      value={email} onChange={e => setEmail(e.target.value)}/>
                                    </Form.Group>

                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px" , fontWeight: "600"}}  className="font-bold" variant="primary" onClick={handleAddDoctor}>Save</Button>
                                <Button style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px" , fontWeight: "600"}}  className="font-bold" variant="success" onClick={handleUpdateDoctor}>Update</Button>
                                <Button style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px" , fontWeight: "600"}}  className="font-bold" variant="secondary" onClick={handleClose}>Close</Button>
                            </Modal.Footer>
                        </Modal>
                        <br/>
                        <div className="overflow-x-auto overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-md">
                            <div className="overflow-x-auto">
                                <Table striped bordered hover responsive
                                       className="w-full text-center border border-gray-300" >
                                    <thead className="bg-red-500 text-white">
                                    <tr className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>
                                        <th className="px-4 py-2 border">Doctor ID</th>
                                        <th className="px-4 py-2 border">Full Name</th>
                                        <th className="px-4 py-2 border">specialty</th>
                                        <th className="px-4 py-2 border">Profile pic</th>
                                        <th className="px-4 py-2 border">Gender</th>
                                        <th className="px-4 py-2 border">Phone</th>
                                        <th className="px-4 py-2 border">Email</th>
                                        <th className="px-4 py-2 border">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody style={{ fontFamily: "'Montserrat', serif" ,
                                        fontSize: "14px",fontWeight: "400"}}>
                                        {doctors.map((doctor) => (
                                            <tr key={doctor.doctorId} onClick={() => handleEditDoctor(doctor)}
                                                className="hover:bg-blue-100 transition-all">
                                                <td className="px-4 py-2 border">{doctor.doctorId}</td>
                                                <td className="px-4 py-2 border">{doctor.doctorName}</td>
                                                <td className="px-4 py-2 border">{doctor.specialty}</td>
                                                <td className="px-4 py-2 border">
                                                    {doctor.doctorImg ? (
                                                        <img src={`data:image/jpeg;base64,${doctor.doctorImg}`}
                                                             alt="Patient Image"
                                                             className="w-[40px] h-[0px] object-cover rounded-full"/>
                                                    ) : (
                                                        <span>No Image</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 border">{doctor.gender}</td>
                                                <td className="px-4 py-2 border">{doctor.contactNumber}</td>
                                                <td className="px-4 py-2 border">{doctor.email}</td>
                                                <td className="px-4 py-2 border flex justify-center gap-2 h-[80px]">
                                                    <button
                                                        className="bg-red-500 text-white px-3 h-[40px] py-1 rounded-md hover:bg-red-700"
                                                        onClick={(event) => handleDeleteDoctor(event, doctor.doctorId)}>Delete
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

export default DoctorSection;
