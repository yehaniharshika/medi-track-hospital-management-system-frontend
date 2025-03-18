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
import {Department} from "../models/Department.ts";
import {deleteDepartment, getDepartments, saveDepartment, updateDepartment} from "../reducers/DepartmentSlice.ts";
import Swal from "sweetalert2";
import "./style/calendar.css";

const DepartmentSection = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [departmentId, setDepartmentId] = useState("");
    const [departmentName, setDepartmentName] = useState("");
    const [departmentEmail, setDepartmentEmail] = useState("");
    const [location, setLocation] = useState("");
    const [headOfDepartment, setHeadOfDepartment] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const dispatch = useDispatch<AppDispatch>();


    const validateDepartmentName = (name: string) => {
        if (!/^[A-Za-z\s]{3,}$/.test(name)) {
            Swal.fire({
                title: "❌ Error!",
                html: '<p class="swal-text">Invalid department name! It must contain at least 3 letters.</p>',
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

    const validateLocation = (loc: string) => {
        if (loc.trim().length < 3) {
            Swal.fire({
                title: "❌ Error!",
                html: '<p class="swal-text">Invalid location! It must contain at least 3 characters.</p>',
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

    const validatePhoneNumber = (phone: string) => {
        if (!/^(?:\+94|0)(7\d{8}|38\d{7})$/.test(phone)) {
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

    const departments = useSelector((state: RootState) => state.departments);

    const generateNextDepartmentId = (existingDepartments: Department[]) => {
        if (!existingDepartments || existingDepartments.length === 0) {
            return 'D001';
        }

        const departmentIds = existingDepartments
            .map(d => d.departmentId ? Number(d.departmentId.replace('D', '')) : 0)
            .filter(num => !isNaN(num)); // Remove invalid IDs

        if (departmentIds.length === 0) {
            return 'D001';
        }

        const maxId = Math.max(...departmentIds);
        return `D${String(maxId + 1).padStart(3, '0')}`; //increment and format
    };

    useEffect(() => {
        dispatch(getDepartments()).then((response) => {
            const nextDepartmentId = generateNextDepartmentId(response.payload);
            setDepartmentId(nextDepartmentId); //automatically set the generated ID
        });
    }, [dispatch]);


    const handleEditDepartment = (department: Department) => {
        setDepartmentId(department.departmentId);
        setDepartmentName(department.departmentName);
        setDepartmentEmail(department.departmentEmail);
        setLocation(department.location);
        setHeadOfDepartment(department.headOfDepartment);
        setPhoneNumber(department.phoneNumber);
        setShow(true);
    };

    const resetForm = () => {
        setDepartmentId('');
        setDepartmentName('');
        setDepartmentEmail('');
        setLocation('');
        setHeadOfDepartment('');
        setPhoneNumber('');
    };


    const handleAddDepartment = () => {
        if (
            !departmentId ||
            !validateDepartmentName(departmentName) ||
            !validateEmail(departmentEmail) ||
            !validateLocation(location) ||
            !headOfDepartment ||
            !validatePhoneNumber(phoneNumber)
        ) {
            return;
        }

        const newDepartment = {departmentId,departmentName,departmentEmail,location,headOfDepartment,phoneNumber};
        dispatch(saveDepartment(newDepartment)).then(() => {
            dispatch(getDepartments());
        });
        resetForm();
        setDepartmentId(generateNextDepartmentId(departments));
        handleClose();
    }


    const handleUpdateDepartment = () => {
        if (
            !departmentId ||
            !validateDepartmentName(departmentName) ||
            !validateEmail(departmentEmail) ||
            !validateLocation(location) ||
            !headOfDepartment ||
            !validatePhoneNumber(phoneNumber)
        ) {
            return;
        }

        const updatedDepartment = {departmentId,departmentName,departmentEmail,location,headOfDepartment,phoneNumber};
        dispatch(updateDepartment(updatedDepartment)).then(() => {
            dispatch(getDepartments());
        });
        resetForm();
        setDepartmentId(generateNextDepartmentId(departments));
        handleClose();
    }


    const handleDeleteDepartment = (event: React.MouseEvent<HTMLButtonElement>, departmentId: string) => {
        event.stopPropagation();
        dispatch(deleteDepartment(departmentId));
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
                                            <motion.h4
                                                className="font-bold text-2xl text-neutral-100"
                                                style={{fontFamily: "'Ubuntu', sans-serif",
                                                    fontWeight: "bold" ,color: "white"}}
                                                initial={{scale: 0.8, opacity: 0}}
                                                animate={{scale: 1, opacity: 1}}
                                                transition={{
                                                    delay: 0.2,
                                                    duration: 0.6,
                                                    ease: "easeOut",
                                                }}
                                            >
                                                Department Management
                                            </motion.h4>
                                        </Row>
                                    </Container>
                                </motion.div>
                            </Col>
                        </Row>
                        <br/>
                        <div className="flex justify-between items-center mb-4">

                            <Button variant="primary" onClick={handleShow} className="h-10 max-w-40 font-bold" style={{ fontFamily: "'Montserrat', serif" ,fontSize: "15px",fontWeight: "bold"}}>
                                + Department
                            </Button>

                            <div className="w-1/3">
                                <InputGroup>
                                    <FormControl className="border-2 border-black" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px"}} placeholder="Search Department..."/>
                                    <InputGroup.Text className="cursor-pointer border-2 border-black">
                                        <MdSearch/>
                                    </InputGroup.Text>
                                </InputGroup>
                            </div>
                        </div>
                        <Modal show={show} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title className="font-bold" style={{fontFamily: "'Montserrat', serif",fontWeight:"600"}}>Department Details Form</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{backgroundColor:"#cec4ff"}}>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Department ID</Form.Label>
                                        <Form.Control className="border-2 border-black" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px",fontWeight: "550" , color: "darkblue"}} type="text"
                                                      value={departmentId} onChange={e => setDepartmentId(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Department Name</Form.Label>
                                        <Form.Control className="border-2 border-black font-normal" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px",}} type="text" value={departmentName} placeholder="Enter Department Name" onChange={e => setDepartmentName(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Department Email</Form.Label>
                                        <Form.Control className="border-2 border-black font-normal" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px",}} type="email" value={departmentEmail} placeholder="Enter Email" onChange={e => setDepartmentEmail(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Location</Form.Label>
                                        <Form.Control placeholder="Enter Location" className="border-2 border-black" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px"}} type="text"
                                                      value={location} onChange={e => setLocation(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>
                                            Head Of Department</Form.Label>
                                        <Form.Control placeholder="Enter Head Of Department" className="border-2 border-black" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px"}} type="text"
                                                      value={headOfDepartment} onChange={e => setHeadOfDepartment(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Phone Number
                                        </Form.Label>
                                        <Form.Control placeholder="Enter Contact Number" className="border-2 border-black" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px"}} type="tel" value={phoneNumber}
                                                      onChange={e => setPhoneNumber(e.target.value)}/>
                                    </Form.Group>

                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button style={{ fontFamily: "'Montserrat', serif" ,
                                    fontSize: "15px" , fontWeight: "600"}} className="font-bold" variant="primary" onClick={handleAddDepartment}>Save</Button>
                                <Button  style={{ fontFamily: "'Montserrat', serif" ,
                                    fontSize: "15px" , fontWeight: "600"}} className="font-bold" variant="success" onClick={handleUpdateDepartment}>Update</Button>
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
                                        <th className="px-4 py-2 border">Department ID</th>
                                        <th className="px-4 py-2 border">Department Name</th>
                                        <th className="px-4 py-2 border">Email</th>
                                        <th className="px-4 py-2 border">Location</th>
                                        <th className="px-4 py-2 border">Head Of Department</th>
                                        <th className="px-4 py-2 border">Phone</th>
                                        <th className="px-4 py-2 border">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody style={{ fontFamily: "'Montserrat', serif" , fontSize: "14px",fontWeight: "400"}}>
                                    {departments.map((department) => (
                                        <tr key={department.departmentId} onClick={() => handleEditDepartment(department)} className="hover:bg-blue-100 transition-all">
                                            <td className="px-4 py-2 border">{department.departmentId}</td>
                                            <td className="px-4 py-2 border">{department.departmentName}</td>
                                            <td className="px-4 py-2 border">{department.departmentEmail}</td>
                                            <td className="px-4 py-2 border">{department.location}</td>
                                            <td className="px-4 py-2 border">{department.headOfDepartment}</td>
                                            <td className="px-4 py-2 border">{department.phoneNumber}</td>
                                            <td className="px-4 py-2 border flex justify-center gap-2 h-[80px]">
                                                <button className="bg-red-500 text-white px-3 h-[40px] py-1 rounded-md hover:bg-red-700"
                                                    onClick={(event) => handleDeleteDepartment(event, department.departmentId)}>
                                                    Delete
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

export default DepartmentSection;
