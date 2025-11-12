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
import {Medicine} from "../models/Medicine.ts";
import {deleteMedicine, getMedicines, saveMedicine, updateMedicine} from "../reducers/MedicineSlice.ts";
import { Header } from "../components/Header.tsx";

const MedicineSection = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [medicineId, setMedicineId] = useState("");
    const [medicineName, setMedicineName] = useState("");
    const [brand, setBrand] = useState("");
    const [dosage_form, setDosage_form] = useState("");
    const [unit_price, setUnit_price] = useState("");
    const [quantity_in_stock, setQuantity_in_stock] = useState(0);
    const [expiry_date,setExpiry_date] = useState("");
    const [medicineImg, setMedicineImg] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const dispatch = useDispatch<AppDispatch>();

    const medicines = useSelector((state: RootState) => state.medicines);

    useEffect(() => {
        dispatch(getMedicines());
    }, [dispatch]);


    useEffect(() => {
        if (medicines.length > 0) {
            const initialMedicineId = generateNextMedicineId(medicines);
            setMedicineId(initialMedicineId);
        }
    }, [medicines]);


    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setMedicineImg(file);

            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result as string); // Store Base64 for preview
            };
            reader.readAsDataURL(file);
        }
    };

    const generateNextMedicineId = (existingMedicines: Medicine[]) => {
        if (!existingMedicines || existingMedicines.length === 0) {
            return 'M001'; // Default if no medicines
        }

        const medicineIds = existingMedicines
            .map(m => m.medicineId ? Number(m.medicineId.replace('M', '')) : 0)
            .filter(num => !isNaN(num)); // Remove invalid IDs

        if (medicineIds.length === 0) {
            return 'M001';
        }

        const maxId = Math.max(...medicineIds); // Get the highest numeric Id
        const nextMedicineId = `M${String(maxId + 1).padStart(3, '0')}`; // Increment and format
        return nextMedicineId;
    };


    useEffect(() => {
        if (medicines && medicines.length > 0) {
            const nextMedicineId = generateNextMedicineId(medicines);
            setMedicineId(nextMedicineId); // Automatically set the generated ID
        }
    }, [medicines]);


    const handleEditMedicine = (medicine: Medicine) => {
        setMedicineId(medicine.medicineId);
        setMedicineName(medicine.medicineName);
        setBrand(medicine.brand);
        setPreviewImage(medicine.medicineImg ? `data:image/jpeg;base64,${medicine.medicineImg}` : null);
        setMedicineImg(null);
        setDosage_form(medicine.dosage_form);
        setUnit_price(medicine.unit_price);
        setQuantity_in_stock(medicine.quantity_in_stock);
        setExpiry_date(medicine.expiry_date);
        setShow(true);
    };

    const resetForm = () => {
        setMedicineId('');
        setMedicineName('');
        setBrand('');
        setMedicineImg(null);
        setPreviewImage(null);
        setDosage_form('');
        setUnit_price('');
        setQuantity_in_stock(0);
        setExpiry_date('');

        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };


    const handleAddMedicine = () => {
        const formData = new FormData();

        formData.append("medicineId", medicineId);
        formData.append("medicineName", medicineName);
        formData.append("brand", brand);
        formData.append("dosage_form", dosage_form);
        formData.append("unit_price", unit_price);
        formData.append("quantity_in_stock", String(quantity_in_stock));
        formData.append("expiry_date", expiry_date);

        if (medicineImg) {
            formData.append("medicineImg", medicineImg);
        }

        dispatch(saveMedicine(formData)).then(() => {
            dispatch(getMedicines());
        });

        resetForm();
        setMedicineId(generateNextMedicineId(medicines))
        handleClose();
    }

    const handleUpdateMedicine = () => {
        const formData = new FormData();

        formData.append("medicineId", medicineId);
        formData.append("medicineName", medicineName);
        formData.append("brand", brand);
        formData.append("dosage_form", dosage_form);
        formData.append("unit_price", unit_price);
        formData.append("quantity_in_stock", String(quantity_in_stock));
        formData.append("expiry_date", expiry_date);

        if (medicineImg) {
            formData.append("medicineImg", medicineImg);
        }

        dispatch(updateMedicine(formData)).then(() => {
            dispatch(getMedicines());
        });

        resetForm();
        setMedicineId(generateNextMedicineId(medicines));
        handleClose();
    }

    const handleDeleteMedicine = (event: React.MouseEvent<HTMLButtonElement>, medicineId: string) => {
        event.stopPropagation();
        dispatch(deleteMedicine(medicineId));
    };


    return (
        <>
            <div className="flex overflow-hidden bg-purple-500">
                <Navigation isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1" style={{backgroundColor: "#cec4ff"}}>
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <Container fluid>
                        
                        <div className="flex justify-between items-center mb-4 mt-5">
                            <Button
                                variant="primary"
                                onClick={handleShow}
                                className="h-10 max-w-40 font-bold"
                                style={{ fontFamily: "'Montserrat', serif" ,fontSize: "15px",fontWeight: "bold"}}
                            >
                                + Medicine
                            </Button>

                            <div className="w-1/3">
                                <InputGroup>
                                    <FormControl
                                        className="border-2 border-black"
                                        style={{ fontFamily: "'Montserrat', serif" ,
                                            fontSize: "15px"}}
                                        placeholder="Search Medicine..."
                                    />
                                    <InputGroup.Text className="cursor-pointer border-2 border-black">
                                        <MdSearch/>
                                    </InputGroup.Text>
                                </InputGroup>
                            </div>
                        </div>
                        <Modal show={show} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title className="font-bold" style={{fontFamily: "'Montserrat', serif",fontWeight:"600"}}>Medicine
                                    Details Form</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{backgroundColor:"#cec4ff"}}>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Medicine ID</Form.Label>
                                        <Form.Control className="border-2 border-black" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px",fontWeight: "550" , color: "darkblue"}} type="text"
                                                      value={medicineId} onChange={e => setMedicineId(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Medicine Name</Form.Label>
                                        <Form.Control className="border-2 border-black font-normal" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px",}}
                                                      type="text"
                                                      value={medicineName}
                                                      placeholder="Enter medicine name"
                                                      onChange={e => setMedicineName(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Brand</Form.Label>
                                        <Form.Control className="border-2 border-black font-normal" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px",}}
                                                      type="text"
                                                      value={brand}
                                                      placeholder="Enter medicine brand"
                                                      onChange={e => setBrand(e.target.value)}/>
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

                                    <Form.Group className="mb-3" controlId="dosage_form">
                                        <Form.Label className="font-bold" style={{ fontFamily: "'Montserrat', serif" , fontSize: "15px"}}>Dosage Form</Form.Label>
                                        <Form.Select className="border-2 border-black"
                                                     style={{fontFamily: "'Montserrat', serif", fontSize: "15px"}}
                                                     value={dosage_form} onChange={e => setDosage_form(e.target.value)}>
                                            <option value="">Select dosage form</option>
                                            <option value="Tablet">Tablet</option>
                                            <option value="Capsule">Capsule</option>
                                            <option value="Syrup">Syrup</option>
                                            <option value="Injection">Injection</option>
                                            <option value="Injection">Inhaler</option>
                                            <option value="Gel">Gel</option>
                                            <option value="Cream">Cream</option>
                                            <option value="Eye drops">Eye drops</option>
                                            <option value="Eye ointment">Eye ointment</option>
                                            <option value="Ear drops">Ear drops </option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Unit Price</Form.Label>
                                        <Form.Control placeholder="Enter Unit Price"
                                                      className="border-2 border-black"
                                                      style={{ fontFamily: "'Montserrat', serif" ,
                                                          fontSize: "15px"}} type="number"
                                                      value={unit_price}
                                                      onChange={e => setUnit_price(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>quantity in stock</Form.Label>
                                        <Form.Control
                                            placeholder="Enter Email"
                                            className="border-2 border-black"
                                            style={{ fontFamily: "'Montserrat', serif", fontSize: "15px" }}
                                            type="number"
                                            value={quantity_in_stock}
                                            onChange={e => setQuantity_in_stock(Number(e.target.value))}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="font-bold" style={{fontFamily: "'Ubuntu', sans-serif"}}>Expiry Date</Form.Label>
                                        <Form.Control className="border-2 border-black font-normal" style={{ fontFamily: "'Montserrat', serif" ,
                                            fontSize: "15px"}}  type="date" value={expiry_date} onChange={e => setExpiry_date(e.target.value)}/>
                                    </Form.Group>
                                    <br/>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button style={{ fontFamily: "'Montserrat', serif" ,
                                    fontSize: "15px" , fontWeight: "600"}} className="font-bold" variant="primary" onClick={handleAddMedicine}>Save</Button>
                                <Button  style={{ fontFamily: "'Montserrat', serif" ,
                                    fontSize: "15px" , fontWeight: "600"}} className="font-bold" variant="success" onClick={handleUpdateMedicine}>Update</Button>
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
                                        <th className="px-4 py-2 border">Medicine ID</th>
                                        <th className="px-4 py-2 border">Name</th>
                                        <th className="px-4 py-2 border">Brand</th>
                                        <th className="px-4 py-2 border">Image</th>
                                        <th className="px-4 py-2 border">Dosage form</th>
                                        <th className="px-4 py-2 border">Unit Price</th>
                                        <th className="px-4 py-2 border">Stock</th>
                                        <th className="px-4 py-2 border">Expiry Date</th>
                                        <th className="px-4 py-2 border">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody style={{ fontFamily: "'Montserrat', serif" ,
                                        fontSize: "14px",fontWeight: "400"}}>
                                    {medicines.map((medicine) => (
                                        <tr key={medicine.medicineId} onClick={() => handleEditMedicine(medicine)}
                                            className="hover:bg-blue-100 transition-all">
                                            <td className="px-4 py-2 border">{medicine.medicineId}</td>
                                            <td className="px-4 py-2 border">{medicine.medicineName}</td>
                                            <td className="px-4 py-2 border">{medicine.brand}</td>
                                            <td className="px-4 py-2 border">
                                                {medicine.medicineImg ? (
                                                    <img src={`data:image/jpeg;base64,${medicine.medicineImg}`}
                                                         alt="Patient Image"
                                                         className="w-[60px] h-[60px] object-cover rounded-full"/>
                                                ) : (
                                                    <span>No Image</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border">{medicine.dosage_form}</td>
                                            <td className="px-4 py-2 border">{medicine.unit_price}</td>
                                            <td className="px-4 py-2 border">{medicine.quantity_in_stock}</td>
                                            <td className="px-4 py-2 border">{medicine.expiry_date}</td>
                                            <td className="px-4 py-2 border flex justify-center gap-2 h-[80px]">
                                                <button
                                                    className="bg-red-500 text-white px-3 h-[40px] py-1 rounded-md hover:bg-red-700"
                                                    onClick={(event) => handleDeleteMedicine(event, medicine.medicineId)}>Delete
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

export default MedicineSection;
