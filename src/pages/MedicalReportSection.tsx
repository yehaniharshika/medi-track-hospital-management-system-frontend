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
import {MedicalReport} from "../models/ MedicalReport.ts";
import {deleteMedicalReport, getMedicalReports, saveMedicalReport, updateMedicalReport} from "../reducers/MedicalReportSlice.ts";
import {jsPDF} from "jspdf";
import { Header } from "../components/Header.tsx";



const MedicalReportSection = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [medicalReportId, setMedicalReportId] = useState("");
    const [patientId, setPatientId] = useState("");
    const [patientIds, setPatientIds] = useState<string[]>([]);
    const [doctorId, setDoctorId] = useState("");
    const [doctorIds, setDoctorIds] = useState<string[]>([]);
    const [patientName, setPatientName] = useState("");
    const [doctorName, setDoctorName] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");
    const [testResults, setTestResults] = useState<{
        description: string;
        result: string;
        units: string;
        referenceRange: string;
        stat: string;
    }[]>([]);
    const [reportDate, setReportDate] = useState("");
    const [notes, setNotes] = useState("");

    const dispatch = useDispatch<AppDispatch>();


    const patients = useSelector((state: RootState) => state.patients);
    const doctors = useSelector((state: RootState) => state.doctors);
    const medicalReports = useSelector((state: RootState) => state.medicalReports);

    const handleTestResultChange = (index: number, field: keyof typeof testResults[0], value: string) => {
        const updatedTestResults = [...testResults];
        updatedTestResults[index][field] = value;
        setTestResults(updatedTestResults);
    };

    const addTestResult = () => {
        setTestResults([...testResults, { description: '', result: '', units: '', referenceRange: '', stat: '' }]);
    };

    const generateNextMedicalReportId = (existingMedicalReports : MedicalReport[]) => {
        if (!existingMedicalReports || existingMedicalReports.length === 0) {
            return 'MR001';
        }

        const medicalReportIds = existingMedicalReports
            .map(mr => mr.medicalReportId ? Number(mr.medicalReportId.replace('MR', '')) : 0)
            .filter(num => !isNaN(num));

        if (medicalReportIds.length === 0) {
            return 'MR001';
        }

        const maxId = Math.max(...medicalReportIds);
        return `MR${String(maxId + 1).padStart(3, '0')}`;
    };

    useEffect(() => {
        // Set formatted date
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0]; // format as YYYY-MM-DD
        setReportDate(formattedDate);

        // Load Patient IDs
        const patientIdArray = patients.map((p) => p.patientId);
        setPatientIds(patientIdArray);

        // Update Selected Patient Details
        const selectedPatient = patients.find(p => p.patientId === patientId);
        setPatientName(selectedPatient ? selectedPatient.patientName : '');
        setGender(selectedPatient ? selectedPatient.gender : '');
        setAge(selectedPatient ? selectedPatient.age : '');

        // Load Doctor IDs
        const doctorIdArray = doctors.map((doc) => doc.doctorId);
        setDoctorIds(doctorIdArray);

        // Update Selected Doctor Details
        const selectedDoctor = doctors.find(doc => doc.doctorId === doctorId);
        setDoctorName(selectedDoctor ? selectedDoctor.doctorName : '');
        setSpecialty(selectedDoctor ? selectedDoctor.specialty : '');

    }, [patients, patientId, doctors, doctorId]);

    useEffect(() => {
        dispatch(getMedicalReports());
    }, [dispatch]);

    useEffect(() => {
        if (medicalReports && medicalReports.length > 0) {
            const nextMedicalReportId = generateNextMedicalReportId(medicalReports);
            setMedicalReportId(nextMedicalReportId);
        }
    }, [medicalReports]);


    const handleEditMedicalReport = (medicalReport: MedicalReport) => {
        setMedicalReportId(medicalReport.medicalReportId);
        setPatientId(medicalReport.patientId);
        setPatientName(medicalReport.patientName);
        setTestResults(medicalReport.testResults);
        setReportDate(medicalReport.reportDate);
        setNotes(medicalReport.notes);
        setDoctorId(medicalReport.doctorId);
        setShow(true);
    };

    const resetForm = () => {
        setMedicalReportId('');
        setPatientId('');
        setPatientName('');
        setGender('');
        setTestResults([]);
        setReportDate('');
        setNotes('');
        setDoctorId('');
        setDoctorName('');
        setSpecialty('');
    };


    const handleAddMedicalReport = () => {
        if (!medicalReportId || !reportDate || !testResults || !notes || !patientId || !doctorId) {
            alert("All fields are required!");
            return;
        }

        const newMedicalReport = {medicalReportId,reportDate,testResults,notes,patientId,patientName,doctorId};
        dispatch(saveMedicalReport(newMedicalReport)).then(() => {
            dispatch(getMedicalReports());
        });
        resetForm();
        setMedicalReportId(generateNextMedicalReportId(medicalReports))
        handleClose();
    }


    const handleUpdateMedicalReport = () => {
        if (!medicalReportId || !reportDate || !testResults || !notes || !patientId || !doctorId) {
            alert("All fields are required!");
            return;
        }

        const updatedMedicalReport = {medicalReportId,reportDate,testResults,notes,patientId,patientName,doctorId};
        dispatch(updateMedicalReport(updatedMedicalReport)).then(() => {
            dispatch(getMedicalReports());
        });
        resetForm();
        setMedicalReportId(generateNextMedicalReportId(medicalReports))
        handleClose();
    }


    const handleDeleteMedicalReport = (event: React.MouseEvent<HTMLButtonElement>, medicalReportId: string) => {
        event.stopPropagation();
        dispatch(deleteMedicalReport(medicalReportId));

    };

    const getBase64Image = (imgPath: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imgPath;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                } else {
                    reject('Canvas context is not available.');
                }
            };
            img.onerror = (error) => reject(error);
        });
    };


    const generateReport = async () => {
        const doc = new jsPDF();

        // Add Ubuntu Font
        doc.addFileToVFS("Ubuntu-Regular.ttf", "<BASE64_ENCODED_UBUNTU_REGULAR>");
        doc.addFont("Ubuntu-Regular.ttf", "Ubuntu", "normal");
        doc.addFileToVFS("Ubuntu-Bold.ttf", "<BASE64_ENCODED_UBUNTU_BOLD>");
        doc.addFont("Ubuntu-Bold.ttf", "Ubuntu", "bold");
        doc.addFileToVFS("Ubuntu-Italic.ttf", "<BASE64_ENCODED_UBUNTU_ITALIC>");
        doc.addFont("Ubuntu-Italic.ttf", "Ubuntu", "italic");

        try {
            // Convert Image to Base64 and Add to PDF
            const logoBase64 = await getBase64Image('/src/images/LOGO.png');
            doc.addImage(logoBase64, 'PNG', 20, 10, 30, 30);

            // Logo and Header
            doc.setFontSize(18);
            doc.setTextColor(0, 0, 139);
            doc.setFont("Ubuntu", "bold");
            doc.text("MediTrack Healthcare Services (Pvt) Ltd.", 60, 30);

            // Line separator and Address
            doc.line(20, 45, 190, 45);
            doc.setFont("Ubuntu", "normal");
            doc.setFontSize(10);
            doc.setTextColor(139, 0, 0);
            doc.text("No. 123, Main Street, Colombo", 65, 50);
            doc.text("Hotline: +94 77 123 4567 | Email: info@meditrack.lk | Reg No: MT123456", 30, 60);

            // Leave a space of about one line and display patient details
            let yOffset = 80;
            doc.setFont("Ubuntu", "normal");
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            const lineHeight = 5;
            doc.text(`Report ID: ${medicalReportId}`, 20, yOffset);
            yOffset += lineHeight;
            doc.text(`Patient ID: ${patientId}`, 20, yOffset);
            yOffset += lineHeight;
            doc.text(`Patient Name: ${patientName}`, 20, yOffset);
            yOffset += lineHeight;
            doc.text(`Age: ${age}`, 20, yOffset);
            yOffset += lineHeight;
            doc.text(`Gender: ${gender}`, 20, yOffset);

            // Leave a space of about 2 lines before test results
            yOffset += lineHeight * 3;

            // Table Headers for Test Results
            doc.setFont("Ubuntu", "bold");
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            doc.text("Description", 22, yOffset);
            doc.text("Result", 72, yOffset);
            doc.text("Units", 102, yOffset);
            doc.text("Reference Range", 132, yOffset);
            doc.text("Stat", 182, yOffset);

            // Draw Table Header Line
            yOffset += 5;
            doc.line(20, yOffset, 190, yOffset);

            // Test Results Table Rows
            doc.setFont("Ubuntu", "normal");
            yOffset += 5;

            testResults.forEach((test) => {
                doc.text(test.description || '', 22, yOffset);
                doc.text(test.result || '', 72, yOffset);
                doc.text(test.units || '', 102, yOffset);
                doc.text(test.referenceRange || '', 132, yOffset);
                doc.text(test.stat || '', 182, yOffset);
                yOffset += lineHeight;
            });

            const tableStartY = 80 + lineHeight * 6;
            const tableEndY = yOffset;

            // Draw Table Borders
            doc.setDrawColor(0);
            doc.setLineWidth(0.2);
            doc.line(20, tableStartY, 20, tableEndY);
            doc.line(190, tableStartY, 190, tableEndY);
            doc.line(70, tableStartY, 70, tableEndY);
            doc.line(100, tableStartY, 100, tableEndY);
            doc.line(130, tableStartY, 130, tableEndY);
            doc.line(180, tableStartY, 180, tableEndY);
            doc.line(20, tableEndY, 190, tableEndY);

            // Leave a space of about one line after the table
            yOffset += lineHeight * 3;

            // Display Thank You Message at the Center
            const thankYouY = 250;
            doc.setFont("Ubuntu", "italic");
            doc.setFontSize(9);
            doc.setTextColor(139, 0, 0);
            doc.text("Thank you for choosing MediTrack Healthcare Services!", 50, thankYouY);

            // Display Doctor's Name and Specialty at the Bottom Left
            const doctorNameY = 270;
            doc.setFont("Ubuntu", "normal");
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.text("Dr. John Doe", 20, doctorNameY);
            doc.setFont("Ubuntu", "normal");
            doc.text("Specialist in Internal Medicine", 20, doctorNameY + lineHeight);

            // Save the generated PDF
            doc.save(`medical-report-${patientId}.pdf`);
        } catch (error) {
            console.error("Failed to load logo image:", error);
        }
    };



    return (
        <>
            <div className="flex overflow-hidden bg-purple-500">
                <Navigation isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1" style={{backgroundColor: "#cec4ff"}}>
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <Container fluid>
                        
                        <div className="flex justify-between items-center mb-4 mt-5">
                            <Button variant="primary" onClick={handleShow} className="h-10 max-w-40 font-bold" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px" ,fontWeight: "bold"}} >
                                + Medical Report
                            </Button>

                            <div className="w-1/3">
                                <InputGroup>
                                    <FormControl className="border-2 border-black" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px"}} placeholder="Search Medical Report..."/>
                                    <InputGroup.Text className="cursor-pointer border-2 border-black">
                                        <MdSearch/>
                                    </InputGroup.Text>
                                </InputGroup>
                            </div>
                        </div>
                        <Modal show={show} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title className="font-bold" style={{fontFamily: "'Montserrat', serif",fontWeight:"600"}}>Medical Report Details Form</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{backgroundColor:"#cec4ff"}}>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Report ID</Form.Label>
                                        <Form.Control className="border-2 border-black"
                                                      style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px" , fontWeight: "550" , color: "darkblue"}} type="text"
                                                      value={medicalReportId}
                                                      onChange={e => setMedicalReportId(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Report Date</Form.Label>
                                        <Form.Control className="border-2 border-black font-normal" style={{
                                            fontFamily: "'Montserrat', serif",
                                            fontSize: "15px"
                                        }} type="date" value={reportDate}
                                                      onChange={e => setReportDate(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>
                                            Patient Id
                                        </Form.Label>
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
                                                <Form.Control className="border-2 border-black" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} type="text" value={patientName}/>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group controlId="firstName">
                                                <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Gender</Form.Label>
                                                <Form.Control className="border-2 border-black" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} type="text" value={gender} readOnly/>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group controlId="staff-id">
                                                <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Age</Form.Label>
                                                <Form.Control className="border-2 border-black" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} type="text" value={age} readOnly/>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{ fontFamily: "'Ubuntu', sans-serif" }}>
                                            Test Results
                                        </Form.Label>

                                        {testResults.map((testResult, index) => (
                                            <div key={index} className="test-result-section">
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Control
                                                            type="text"
                                                            value={testResult.description}
                                                            placeholder="Description"
                                                            onChange={(e) => handleTestResultChange(index, 'description', e.target.value)}
                                                            className="border-2 border-black"
                                                            style={{ fontFamily: "'Montserrat', serif", fontSize: "15px" }}
                                                        />
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Control
                                                            type="text"
                                                            value={testResult.result}
                                                            placeholder="Result"
                                                            onChange={(e) => handleTestResultChange(index, 'result', e.target.value)}
                                                            className="border-2 border-black"
                                                            style={{ fontFamily: "'Montserrat', serif", fontSize: "15px" }}
                                                        />
                                                    </Col>
                                                </Row>
                                                <br/>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Control
                                                            type="text"
                                                            value={testResult.units}
                                                            placeholder="Units"
                                                            onChange={(e) => handleTestResultChange(index, 'units', e.target.value)}
                                                            className="border-2 border-black"
                                                            style={{ fontFamily: "'Montserrat', serif", fontSize: "15px" }}
                                                        />
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Control
                                                            type="text"
                                                            value={testResult.referenceRange}
                                                            placeholder="Reference Range"
                                                            onChange={(e) => handleTestResultChange(index, 'referenceRange', e.target.value)}
                                                            className="border-2 border-black"
                                                            style={{ fontFamily: "'Montserrat', serif", fontSize: "15px" }}
                                                        />
                                                    </Col>
                                                </Row>
                                                <br/>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Control
                                                            type="text"
                                                            value={testResult.stat}
                                                            placeholder="Stat"
                                                            onChange={(e) => handleTestResultChange(index, 'stat', e.target.value)}
                                                            className="border-2 border-black"
                                                            style={{ fontFamily: "'Montserrat', serif", fontSize: "15px" }}
                                                        />
                                                    </Col>
                                                </Row>
                                                <hr />
                                            </div>
                                        ))}
                                        <br/>

                                        <Button variant="secondary" onClick={addTestResult} className="mt-2" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}}>
                                            Add Test Result
                                        </Button>
                                    </Form.Group>


                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{ fontFamily: "'Ubuntu', sans-serif" }}>Notes</Form.Label>
                                        <Form.Control as="textarea" rows={3} className="border-2 border-black" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}}
                                            placeholder="Enter notes" value={notes}
                                            onChange={e => setNotes(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>
                                            Doctor ID
                                        </Form.Label>
                                        <Form.Select style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} className="border-2 border-black" aria-label="Default select example" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                                            <option value="">Select Doctor ID</option>
                                            {doctorIds.map((docId) => (
                                                <option key={docId} value={docId}>
                                                    {docId}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group controlId="staff-id">
                                                <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Doctor Full Name</Form.Label>
                                                <Form.Control className="border-2 border-black" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} type="text" value={doctorName}/>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group controlId="firstName">
                                                <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Specialty</Form.Label>
                                                <Form.Control className="border-2 border-black" style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}} type="text" value={specialty}/>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <br/>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button style={{
                                    fontFamily: "'Montserrat', serif",
                                    fontSize: "15px", fontWeight: "600"
                                }} className="font-bold" variant="primary"
                                        onClick={handleAddMedicalReport}>Save</Button>
                                <Button style={{
                                    fontFamily: "'Montserrat', serif",
                                    fontSize: "15px", fontWeight: "600"
                                }} className="font-bold" variant="success"
                                        onClick={handleUpdateMedicalReport}>Update</Button>
                                <Button style={{
                                    fontFamily: "'Montserrat', serif",
                                    fontSize: "15px", fontWeight: "600"
                                }} className="font-bold" variant="secondary" onClick={handleClose}>Close</Button>

                                <Button
                                    className="bg-blue-500 text-white px-3 h-[43px] py-1 rounded-md hover:bg-red-700"
                                    style={{fontFamily: "'Montserrat', serif", fontSize: "14px", fontWeight: "bold"}}
                                    onClick={generateReport}>Generate Report
                                </Button>
                            </Modal.Footer>
                        </Modal>
                        <br/>
                        <div className="overflow-x-auto overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-md">
                            <div className="overflow-x-auto">
                                <Table striped bordered hover responsive
                                       className="w-full text-center border border-gray-300">
                                    <thead className="bg-red-500 text-white">
                                    <tr className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>
                                        <th className="px-4 py-2 border">Report ID</th>
                                        <th className="px-4 py-2 border">Report Date</th>
                                        <th className="px-4 py-2 border">Patient ID</th>
                                        <th className="px-4 py-2 border">Test Results</th>
                                        <th className="px-4 py-2 border">notes</th>
                                        <th className="px-4 py-2 border">Doctor ID</th>
                                        <th className="px-4 py-2 border" style={{ width: '180px' }}>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody style={{ fontFamily: "'Montserrat', serif" , fontSize: "14px",fontWeight: "400"}}>
                                    {medicalReports.map((medicalReport) => (
                                        <tr key={medicalReport.medicalReportId}
                                            onClick={() => handleEditMedicalReport(medicalReport)}
                                            className="hover:bg-blue-100 transition-all">
                                            <td className="px-4 py-2 border">{medicalReport.medicalReportId}</td>
                                            <td className="px-4 py-2 border">{medicalReport.reportDate}</td>
                                            <td className="px-4 py-2 border">{medicalReport.patientId}</td>
                                            <td className="px-4 py-2 border">
                                                {medicalReport.testResults && medicalReport.testResults.length > 0 ? (
                                                    medicalReport.testResults.map((result, index) => (
                                                        <div key={index}>
                                                            <span><strong>Description:</strong> {result.description}, </span>
                                                            <span><strong>Result:</strong> {result.result}, </span>
                                                            <span><strong>Units:</strong> {result.units}, </span>
                                                            <span><strong>Reference Range:</strong> {result.referenceRange}, </span>
                                                            <span><strong>Stat:</strong> {result.stat}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span>No test results available</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border">{medicalReport.notes}</td>
                                            <td className="px-4 py-2 border">{medicalReport.doctorId}</td>
                                            <td className="px-4 py-2 border flex justify-center gap-2">
                                                <button
                                                    className="bg-red-500 text-white px-3 h-[43px] py-1 rounded-md hover:bg-red-700"
                                                    style={{ fontFamily: "'Montserrat', serif" , fontSize: "13px",fontWeight: "bold"}}
                                                    onClick={(event) => handleDeleteMedicalReport(event, medicalReport.medicalReportId)}>Delete
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

export default MedicalReportSection;
