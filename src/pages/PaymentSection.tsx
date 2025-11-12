import { Navigation } from "../components/Navigation.tsx";
import {
  Container,
  Col,
  Form,
  Row,
  Button,
  Table,
  Modal,
} from "react-bootstrap";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/Store.ts";
import "../pages/style/doctor.css";
import { createPayment, getPayments } from "../reducers/PaymentSlice.ts";
import { getPatients } from "../reducers/PatientSlice.ts";
import { getMedicines } from "../reducers/MedicineSlice.ts";
import { Payment } from "../models/Payment.ts";
import { jsPDF } from "jspdf";
import Swal from "sweetalert2";
import { Header } from "../components/Header.tsx";

const PaymentSection = () => {
  const [paymentId, setPaymentId] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState("");
  const [totalPrice, setTotalPrice] = useState<number>(0); // Removed duplicate declaration
  const [getQty, setGetQty] = useState<number>(0);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [paymentMedicines, setPaymentMedicines] = useState<any[]>([]);
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");

  const dispatch = useDispatch<AppDispatch>();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const patients = useSelector((state: RootState) => state.patients);
  const medicines = useSelector((state: RootState) => state.medicines);
  const payments = useSelector((state: RootState) => state.payments);

  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Generate Next Payment ID (Only for PI prefix)
  const generateNextPaymentId = (existingPayments: Payment[]): string => {
    if (!existingPayments || existingPayments.length === 0) {
      return "PI001";
    }

    const piPaymentIds = existingPayments
      .map((pay) => pay.paymentId)
      .filter((id) => id && id.startsWith("PI"))
      .map((id) => Number(id.replace("PI", "")))
      .filter((num) => !isNaN(num));

    if (piPaymentIds.length === 0) {
      return "PI001";
    }

    const maxId = Math.max(...piPaymentIds);
    const nextPaymentId = `PI${String(maxId + 1).padStart(3, "0")}`;

    return nextPaymentId;
  };

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // format as YYYY-MM-DD
    setPaymentDate(formattedDate);
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      // Find the patient based on selectedPatientId
      const patient = patients.find((p) => p.patientId === selectedPatient);
      if (patient) {
        setPatientName(patient.patientName);
        setAge(patient.age);
      } else {
        setPatientName(""); // Reset in case of no patient found
        setAge("");
      }
    }
  }, [selectedPatient, patients]);

  useEffect(() => {
    dispatch(getPatients());
    dispatch(getMedicines());
    dispatch(getPayments());
  }, [dispatch]);

  useEffect(() => {
    const storedPaymentId = localStorage.getItem("paymentId");

    if (storedPaymentId) {
      setPaymentId(storedPaymentId); // Use stored paymentId if available
    } else if (payments && payments.length > 0) {
      // Generate the next payment ID based on existing payments
      const nextPaymentId = generateNextPaymentId(payments);
      setPaymentId(nextPaymentId);
      localStorage.setItem("paymentId", nextPaymentId); // Store the new paymentId
    } else {
      setPaymentId("PI001"); // Default value if no payments exist
    }
  }, [payments]);

  const handleMedicineSelect = (medicineId: string) => {
    if (!medicines || medicines.length === 0) {
      console.error("Medicine array is empty or not loaded yet.");
      return;
    }

    const medicine = medicines.find(
      (medicine) => String(medicine.medicineId) === String(medicineId)
    );

    if (!medicine) {
      console.error("Medicine not found for medicine Id:", medicineId);
      return;
    }

    setSelectedMedicine(medicine);
    setGetQty(0);
    setTotalPrice(0); // Reset total price
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = Number(e.target.value);

    if (selectedMedicine) {
      if (qty < 1 || qty > selectedMedicine.quantity_in_stock) {
        alert("Invalid quantity!");
        return;
      }
      setGetQty(qty);
      setTotalPrice(qty * selectedMedicine.unit_price);
    }
  };

  const handleAddToCart = () => {
    if (!selectedMedicine) return;

    if (getQty < 1 || getQty > selectedMedicine.quantity_in_stock) {
      alert("Invalid quantity!");
      return;
    }

    const existingMedicine = paymentMedicines.find(
      (medicine) => medicine.medicineId === selectedMedicine.medicineId
    );

    if (existingMedicine) {
      const updatedPaymentMedicines = paymentMedicines.map((medicine) =>
        medicine.medicineId === selectedMedicine.medicineId
          ? {
              ...medicine,
              quantity_in_stock: medicine.quantity_in_stock + getQty,
              totalPrice:
                (medicine.quantity_in_stock + getQty) * medicine.unit_price,
            }
          : medicine
      );
      setPaymentMedicines(updatedPaymentMedicines);
    } else {
      const newMedicine = {
        ...selectedMedicine,
        quantity_in_stock: getQty,
        totalPrice: getQty * selectedMedicine.unit_price,
      };

      setPaymentMedicines([...paymentMedicines, newMedicine]);
    }
    setGetQty(0);
    setTotalPrice(0);
    setSelectedMedicine(null);
  };

  const handleRemoveItem = (medicineId: string) => {
    setPaymentMedicines(
      paymentMedicines.filter((medicine) => medicine.medicineId !== medicineId)
    );
  };

  const calculateTotalBalance = () => {
    return paymentMedicines.reduce(
      (sum, medicine) => sum + medicine.totalPrice,
      0
    );
  };

  const resetForm = () => {
    setSelectedPatient("");
    setPaymentMedicines([]);
    setTotalPrice(0);
    setPaymentId("");
    setPaymentDate("");
    setPatientName("");
    setAge("");
    setSelectedMedicine(null);
  };

  const handlePlacePayment = () => {
    const paymentData = {
      paymentId: paymentId,
      paymentDate,
      patientId: selectedPatient,
      medicineItems: paymentMedicines.map((medicine, index) => ({
        paymentDetailsId: `PD-${paymentId}-${index + 1}`,
        medicineId: medicine.medicineId,
        getQty: medicine.quantity_in_stock,
        price: medicine.unit_price,
        totalPrice: medicine.totalPrice,
      })),
    };

    dispatch(createPayment(paymentData))
      .then(() => {
        const nextPaymentId = generateNextPaymentId([...payments, paymentData]);
        setPaymentId(nextPaymentId);
        localStorage.setItem("paymentId", nextPaymentId);
      })
      .catch((error) => {
        console.error("Error placing payment:", error);
        alert("Failed to place payment");
      });
  };

  const generatePaymentBill = () => {
    if (
      !paymentId ||
      !paymentDate ||
      paymentMedicines.length === 0 ||
      !selectedPatient
    ) {
      Swal.fire({
        title: "❌ Error!",
        html: '<p class="swal-text">Missing payment details or medicines. Please ensure the payment is created.</p>',
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
        },
      });
      return;
    }

    const patient = patients.find((pat) => pat.patientId === selectedPatient);
    const patientId = patient ? patient.patientId : "Unknown Patient";

    const doc = new jsPDF();

    // Add Ubuntu Font
    doc.addFileToVFS("Ubuntu-Regular.ttf", "<BASE64_ENCODED_UBUNTU_REGULAR>");
    doc.addFont("Ubuntu-Regular.ttf", "Ubuntu", "normal");
    doc.addFileToVFS("Ubuntu-Bold.ttf", "<BASE64_ENCODED_UBUNTU_BOLD>");
    doc.addFont("Ubuntu-Bold.ttf", "Ubuntu", "bold");

    // Use the bold Ubuntu font for the title
    doc.setFont("Ubuntu", "bold");
    doc.setFontSize(18);
    doc.text("MediTrack Healthcare Services(Pvt) .Ltd", 50, 20);

    // Use regular Ubuntu font for other text
    doc.setFont("Ubuntu", "normal");
    doc.setFontSize(12);
    doc.text("66, DS Senanayaka Street, Panadura", 65, 30);
    doc.text("Tel: 038-2233185", 85, 40);
    doc.line(20, 45, 190, 45); // Line separator

    // Order Details
    doc.text(`Payment ID: ${paymentId}`, 20, 55);
    doc.text(`Payment Date: ${paymentDate}`, 20, 65);
    doc.text(`Patient: ${patientId}`, 20, 75);

    // Table Headers
    let yOffset = 90;
    doc.setFontSize(10);
    doc.text("No", 20, yOffset);
    doc.text("Medicine Name", 40, yOffset);
    doc.text("Qty", 100, yOffset);
    doc.text("Price", 120, yOffset);
    doc.text("Total", 150, yOffset);
    doc.line(20, yOffset + 5, 190, yOffset + 5); // Table header line

    // Order Items
    paymentMedicines.forEach((medicine, index) => {
      yOffset += 10;
      const medicinePrice = Number(medicine.unit_price);
      const totalPrice = Number(medicine.totalPrice);

      yOffset += 10;
      doc.text(`${index + 1}`, 20, yOffset);
      doc.text(medicine.medicineName, 40, yOffset);
      doc.text(`${medicine.quantity_in_stock}`, 100, yOffset);
      doc.text(`$${medicinePrice.toFixed(2)}`, 120, yOffset);
      doc.text(`$${totalPrice.toFixed(2)}`, 150, yOffset);
    });

    // Total Balance
    yOffset += 15;
    doc.line(20, yOffset, 190, yOffset);
    doc.text(
      `Total Balance: $${calculateTotalBalance().toFixed(2)}`,
      150,
      yOffset + 10
    );

    // Footer Message
    doc.setFontSize(12);
    doc.text("THANK YOU! COME AGAIN!", 70, yOffset + 20);
    doc.text("Email: meditrackhealthcare@gmail.com", 70, yOffset + 30);

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfUrl);
    setShowModal(true);
    resetForm();
    setPaymentId(generateNextPaymentId(payments));
  };

  return (
    <>
      <div className="flex overflow-hidden bg-purple-500">
        <Navigation
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1" style={{ backgroundColor: "#cec4ff" }}>
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <Container fluid>
            <Container className="mt-5">
              <Row className="justify-content-center">
                <Col md={6}>
                  <Form className="p-4 border rounded bg-white shadow">
                    <Form.Group className="mb-3">
                      <Form.Label
                        className="font-bold"
                        style={{ fontFamily: "'Ubuntu', sans-serif" }}
                      >
                        Payment Id
                      </Form.Label>

                      <Form.Control
                        className="border-2 border-black"
                        style={{
                          fontFamily: "'Montserrat', serif",
                          fontSize: "15px",
                          fontWeight: "550",
                          color: "darkblue",
                        }}
                        type="text"
                        value={paymentId}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label
                        className="font-bold"
                        style={{ fontFamily: "'Ubuntu', sans-serif" }}
                      >
                        Payment Date
                      </Form.Label>
                      <Form.Control
                        className="border-2 border-black font-normal"
                        style={{
                          fontFamily: "'Montserrat', serif",
                          fontSize: "15px",
                        }}
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label
                        className="font-bold"
                        style={{ fontFamily: "'Ubuntu', sans-serif" }}
                      >
                        Select Patient
                      </Form.Label>
                      <Form.Select
                        style={{
                          fontFamily: "'Montserrat', serif",
                          fontSize: "15px",
                        }}
                        className="border-2 border-black"
                        aria-label="Default select example"
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                      >
                        <option value="">Select Patient Id</option>
                        {patients.map((patient) => (
                          <option
                            key={patient.patientId}
                            value={patient.patientId}
                          >
                            {patient.patientId}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label
                        className="font-bold"
                        style={{ fontFamily: "'Ubuntu', sans-serif" }}
                      >
                        Patient Full Name
                      </Form.Label>
                      <Form.Control
                        className="border-2 border-black"
                        style={{
                          fontFamily: "'Montserrat', serif",
                          fontSize: "15px",
                        }}
                        type="text"
                        value={patientName || ""}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label
                        className="font-bold"
                        style={{ fontFamily: "'Ubuntu', sans-serif" }}
                      >
                        Age
                      </Form.Label>
                      <Form.Control
                        className="border-2 border-black"
                        style={{
                          fontFamily: "'Montserrat', serif",
                          fontSize: "15px",
                        }}
                        type="text"
                        value={age || ""}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label
                        className="font-bold"
                        style={{ fontFamily: "'Ubuntu', sans-serif" }}
                      >
                        Select Medicine
                      </Form.Label>
                      <Form.Select
                        style={{
                          fontFamily: "'Montserrat', serif",
                          fontSize: "15px",
                        }}
                        className="border-2 border-black"
                        aria-label="Default select example"
                        value={selectedMedicine?.medicineId || ""}
                        onChange={(e) => handleMedicineSelect(e.target.value)}
                      >
                        <option value="">Select Medicine ID</option>
                        {medicines.map((medicine) => (
                          <option
                            key={medicine.medicineId}
                            value={medicine.medicineId}
                          >
                            {medicine.medicineId}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Form>
                </Col>
                <Col md={6}>
                  <Form className="p-4 border rounded bg-white shadow">
                    {selectedMedicine && (
                      <div className="p-4 border rounded shadow bg-gray-100">
                        <Form.Label
                          style={{
                            fontFamily: "'Ubuntu', sans-serif",
                            fontSize: "15px",
                          }}
                          className="block text-sm font-bold"
                        >
                          Item Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={selectedMedicine.medicineName}
                          style={{
                            fontFamily: "'Montserrat', serif",
                            fontSize: "15px",
                          }}
                          className="border p-2 rounded w-full"
                          disabled
                        />

                        <Form.Label
                          style={{
                            fontFamily: "'Ubuntu', sans-serif",
                            fontSize: "15px",
                          }}
                          className="block text-sm font-bold mt-2"
                        >
                          Price
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={selectedMedicine.unit_price}
                          style={{
                            fontFamily: "'Montserrat', serif",
                            fontSize: "15px",
                          }}
                          className="border p-2 rounded w-full"
                          disabled
                        />

                        <Form.Label
                          style={{
                            fontFamily: "'Ubuntu', sans-serif",
                            fontSize: "15px",
                          }}
                          className="block text-sm font-bold mt-2"
                        >
                          Stock
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={selectedMedicine.quantity_in_stock}
                          style={{
                            fontFamily: "'Montserrat', serif",
                            fontSize: "15px",
                          }}
                          className="border p-2 rounded w-full"
                          disabled
                        />

                        <Form.Label
                          style={{
                            fontFamily: "'Ubuntu', sans-serif",
                            fontSize: "15px",
                          }}
                          className="block text-sm font-bold mt-2"
                        >
                          Get Quantity
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={getQty}
                          min="0"
                          max={selectedMedicine.quantity_in_stock}
                          style={{
                            fontFamily: "'Montserrat', serif",
                            fontSize: "15px",
                          }}
                          onChange={handleQuantityChange}
                          className="border p-2 rounded w-full"
                        />

                        <Form.Label
                          style={{
                            fontFamily: "'Ubuntu', sans-serif",
                            fontSize: "15px",
                          }}
                          className="block text-sm font-bold mt-2"
                        >
                          Total Price
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={totalPrice}
                          style={{
                            fontFamily: "'Montserrat', serif",
                            fontSize: "15px",
                          }}
                          className="border p-2 rounded w-full"
                          disabled
                        />

                        <br />
                        <Button
                          style={{
                            fontFamily: "'Montserrat', serif",
                            fontSize: "15px",
                            fontWeight: "600",
                          }}
                          className="font-bold"
                          variant="success"
                          onClick={handleAddToCart}
                        >
                          Add To Cart
                        </Button>
                      </div>
                    )}
                  </Form>
                </Col>
              </Row>
            </Container>
            <br />
            <div className="flex justify-center">
              <div
                className="overflow-x-auto overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-md"
                style={{ width: "78%" }}
              >
                <div className="overflow-x-auto">
                  <Table
                    striped
                    bordered
                    hover
                    responsive
                    className="w-full text-center border border-gray-300 mx-auto"
                  >
                    <thead className="bg-red-500 text-white">
                      <tr
                        className="font-bold"
                        style={{ fontFamily: "'Ubuntu', sans-serif" }}
                      >
                        <th className="px-4 py-2 border">Medicine Name</th>
                        <th className="px-4 py-2 border">Unit Price</th>
                        <th className="px-4 py-2 border">Quantity</th>
                        <th className="px-4 py-2 border">Total</th>
                        <th className="px-4 py-2 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody
                      style={{
                        fontFamily: "'Montserrat', serif",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                    >
                      {paymentMedicines.map((paymentMedicine) => (
                        <tr key={paymentMedicine.medicineId}>
                          <td className="border px-4 py-2">
                            {paymentMedicine.medicineName}
                          </td>
                          <td className="border px-4 py-2">
                            ${Number(paymentMedicine.unit_price).toFixed(2)}
                          </td>
                          <td className="border px-4 py-2">
                            {paymentMedicine.quantity_in_stock}
                          </td>
                          <td className="border px-4 py-2">
                            $
                            {paymentMedicine.totalPrice
                              ? paymentMedicine.totalPrice.toFixed(2)
                              : "0.00"}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            <Button
                              onClick={() =>
                                handleRemoveItem(paymentMedicine.medicineId)
                              }
                              className="bg-red-500 text-white p-2 rounded-lg"
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <div
                    className="mt-4 font-bold text-xl"
                    style={{
                      fontFamily: "'Montserrat', serif",
                      fontSize: "17px",
                      color: "darkred",
                    }}
                  >
                    Total Balance: ${calculateTotalBalance().toFixed(2)}
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handlePlacePayment}
                    className="bg-green-500 text-white p-2 rounded"
                    style={{
                      fontFamily: "'Montserrat', serif",
                      fontSize: "15px",
                      fontWeight: "600",
                    }}
                  >
                    Place Order
                  </button>

                  <button
                    onClick={generatePaymentBill}
                    className="text-white p-2 rounded"
                    style={{
                      fontFamily: "'Montserrat', serif",
                      fontSize: "15px",
                      fontWeight: "600",
                      backgroundColor: "red",
                    }}
                  >
                    Generate Bill
                  </button>
                </div>
                <Modal
                  show={showModal}
                  onHide={() => setShowModal(false)}
                  size="xl"
                >
                  <Modal.Header closeButton>
                    <Modal.Title style={{ fontFamily: "'Montserrat', serif" }}>
                      Payment Bill
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {pdfUrl ? (
                      <iframe src={pdfUrl} width="100%" height="500px" />
                    ) : (
                      <p>Generating bill...</p>
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      style={{
                        fontFamily: "'Montserrat', serif",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                      variant="secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </Button>
                    <Button
                      style={{
                        fontFamily: "'Montserrat', serif",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                      variant="primary"
                      onClick={() => {
                        if (pdfUrl) {
                          const link = document.createElement("a");
                          link.href = pdfUrl;
                          link.download = `PaymentBill_${paymentId}.pdf`;
                          link.click();
                        }
                      }}
                    >
                      Download PDF
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
};

export default PaymentSection;
