import { Navigation } from "../components/Navigation.tsx";
import { Container, FormControl, InputGroup, Modal } from "react-bootstrap";
import { Col, Form, Row, Table } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import "../pages/style/doctor.css";
import { MdSearch } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/Store.ts";
import { Nurse } from "../models/Nurse.ts";
import {
  deleteNurse,
  getNurses,
  saveNurse,
  updateNurse,
} from "../reducers/NurseSlice.ts";
import Swal from "sweetalert2";
import { Header } from "../components/Header.tsx";

const NurseSection = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nurseId, setNurseId] = useState("");
  const [nurseName, setNurseName] = useState("");
  const [nurseImg, setNurseImg] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [gender, setGender] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [qualification, setQualification] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);

  const dispatch = useDispatch<AppDispatch>();

  const nurses = useSelector((state: RootState) => state.nurses);
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
        },
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
        },
      });
      return false;
    }
    return true;
  };

  const generateNextNurseId = (existingNurses: Nurse[]) => {
    if (!existingNurses || existingNurses.length === 0) {
      return "N001";
    }

    const nurseIds = existingNurses
      .map((n) => (n.nurseId ? Number(n.nurseId.replace("N", "")) : 0))
      .filter((num) => !isNaN(num));

    if (nurseIds.length === 0) {
      return "N001";
    }

    const maxId = Math.max(...nurseIds); // Get the highest numeric Id
    const nextNurseId = `N${String(maxId + 1).padStart(3, "0")}`;
    return nextNurseId ? nextNurseId : nextNurseId;
  };

  useEffect(() => {
    const departmentIdArray = departments.map((dep) => dep.departmentId);
    setDepartmentIds(departmentIdArray);
  }, [departments]);

  useEffect(() => {
    const selectedDepartment = departments.find(
      (dep) => dep.departmentId === departmentId
    );
    setDepartmentName(
      selectedDepartment ? selectedDepartment.departmentName : ""
    );
  }, [departmentId, departments]);

  useEffect(() => {
    dispatch(getNurses());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getNurses()).then((response) => {
      const nextNurseId = generateNextNurseId(response.payload);
      setNurseId(nextNurseId); //automatically set the generated ID
    });
  }, [dispatch]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNurseImg(file);

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string); // Store Base64 for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditNurse = (nurse: Nurse) => {
    setNurseId(nurse.nurseId);
    setNurseName(nurse.nurseName);
    setPreviewImage(
      nurse.nurseImg ? `data:image/jpeg;base64,${nurse.nurseImg}` : null
    );
    setNurseImg(null);
    setGender(nurse.gender);
    setContactNumber(nurse.contactNumber);
    setQualification(nurse.qualification);
    setEmail(nurse.email);
    setDepartmentId(nurse.departmentId);
    setShow(true);
  };

  const resetForm = () => {
    setNurseId("");
    setNurseName("");
    setNurseImg(null);
    setPreviewImage(null);
    setGender("");
    setContactNumber("");
    setQualification("");
    setEmail("");
    setDepartmentId("");

    // Clear file input manually
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleAddNurse = () => {
    if (!validateEmail(email)) {
      return;
    }

    if (!validateContactNumber(contactNumber)) {
      return;
    }

    const formData = new FormData();

    formData.append("nurseId", nurseId);
    formData.append("nurseName", nurseName);
    formData.append("gender", gender);
    formData.append("contactNumber", contactNumber);
    formData.append("qualification", qualification);
    formData.append("email", email);
    formData.append("departmentId", departmentId);

    if (nurseImg) {
      formData.append("nurseImg", nurseImg);
    }

    dispatch(saveNurse(formData)).then(() => {
      dispatch(getNurses());
    });

    resetForm();
    setNurseId(generateNextNurseId(nurses));
    handleClose();
  };

  const handleUpdateNurse = () => {
    if (!validateEmail(email)) {
      return;
    }

    if (!validateContactNumber(contactNumber)) {
      return;
    }

    const formData = new FormData();

    formData.append("nurseId", nurseId);
    formData.append("nurseName", nurseName);
    formData.append("gender", gender);
    formData.append("contactNumber", contactNumber);
    formData.append("qualification", qualification);
    formData.append("email", email);
    formData.append("departmentId", departmentId);

    if (nurseImg) {
      formData.append("nurseImg", nurseImg);
    }

    dispatch(updateNurse(formData)).then(() => {
      dispatch(getNurses());
    });

    resetForm();
    setNurseId(generateNextNurseId(nurses));
    handleClose();
  };

  const handleDeleteNurse = (
    event: React.MouseEvent<HTMLButtonElement>,
    nurseId: string
  ) => {
    event.stopPropagation();
    dispatch(deleteNurse(nurseId));
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
            <div className="flex justify-between items-center mb-4 mt-5">
              <Button
                variant="primary"
                onClick={handleShow}
                className="h-10 max-w-40 font-bold"
                style={{
                  fontFamily: "'Montserrat', serif",
                  fontSize: "15px",
                  fontWeight: "bold",
                }}
              >
                + Add Nurse
              </Button>

              <div className="w-1/3">
                <InputGroup>
                  <FormControl
                    className="border-2 border-black"
                    style={{
                      fontFamily: "'Montserrat', serif",
                      fontSize: "15px",
                    }}
                    placeholder="Search Nurse..."
                  />
                  <InputGroup.Text className="cursor-pointer border-2 border-black">
                    <MdSearch />
                  </InputGroup.Text>
                </InputGroup>
              </div>
            </div>
            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title
                  className="font-bold"
                  style={{
                    fontFamily: "'Montserrat', serif",
                    fontWeight: "600",
                  }}
                >
                  Nurse Details Form
                </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ backgroundColor: "#cec4ff" }}>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label
                      className="font-bold"
                      style={{ fontFamily: "'Ubuntu', sans-serif" }}
                    >
                      Nurse ID
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
                      value={nurseId}
                      onChange={(e) => setNurseId(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label
                      className="font-bold"
                      style={{ fontFamily: "'Ubuntu', sans-serif" }}
                    >
                      Full Name
                    </Form.Label>
                    <Form.Control
                      className="border-2 border-black font-normal"
                      style={{
                        fontFamily: "'Montserrat', serif",
                        fontSize: "15px",
                      }}
                      type="text"
                      value={nurseName}
                      placeholder="Enter full name"
                      onChange={(e) => setNurseName(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label
                      className="font-bold"
                      style={{ fontFamily: "'Ubuntu', sans-serif" }}
                    >
                      Image
                    </Form.Label>
                    <div className="image-box">
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" />
                      ) : (
                        <div
                          className="text-center text-muted font-bold"
                          style={{
                            fontFamily: "'Montserrat', serif",
                            fontSize: "15px",
                          }}
                        >
                          No Image Selected
                        </div>
                      )}
                    </div>
                    <Button className="choose-image-btn" as="label">
                      Choose Image
                      <input
                        type="file"
                        id="file-input"
                        accept="image/*"
                        onChange={handleImageUpload}
                        hidden
                      />
                    </Button>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="gender">
                    <Form.Label
                      className="font-bold"
                      style={{
                        fontFamily: "'Montserrat', serif",
                        fontSize: "15px",
                      }}
                    >
                      Gender
                    </Form.Label>
                    <Form.Select
                      className="border-2 border-black"
                      style={{
                        fontFamily: "'Montserrat', serif",
                        fontSize: "15px",
                      }}
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label
                      className="font-bold"
                      style={{ fontFamily: "'Ubuntu', sans-serif" }}
                    >
                      Contact Number
                    </Form.Label>
                    <Form.Control
                      placeholder="Enter Contact Number"
                      className="border-2 border-black"
                      style={{
                        fontFamily: "'Montserrat', serif",
                        fontSize: "15px",
                      }}
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="gender">
                    <Form.Label
                      className="font-bold"
                      style={{
                        fontFamily: "'Montserrat', serif",
                        fontSize: "15px",
                      }}
                    >
                      Qualification
                    </Form.Label>
                    <Form.Select
                      className="border-2 border-black"
                      style={{
                        fontFamily: "'Montserrat', serif",
                        fontSize: "15px",
                      }}
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                    >
                      <option value="">Select qualification</option>
                      <option value="Diploma in Nursing">
                        Diploma in Nursing
                      </option>
                      <option value="Associate Degree in Nursing (ADN)">
                        Associate Degree in Nursing (ADN)
                      </option>
                      <option value="Bachelor of Science in Nursing (BSc Nursing)">
                        Bachelor of Science in Nursing (BSc Nursing)
                      </option>
                      <option value="Master of Science in Nursing (MSc Nursing)">
                        Master of Science in Nursing (MSc Nursing)
                      </option>
                      <option value="Doctor of Nursing Practice (DNP)">
                        Doctor of Nursing Practice (DNP)
                      </option>
                      <option value="Registered Nurse (RN) Certification">
                        Registered Nurse (RN) Certification
                      </option>
                      <option value="Advanced Practice Registered Nurse (APRN)">
                        Advanced Practice Registered Nurse (APRN)
                      </option>
                      <option value="PhD in Nursing">PhD in Nursing</option>
                      <option value="Licensed Practical Nurse (LPN)">
                        Licensed Practical Nurse (LPN)
                      </option>
                      <option value="Critical Care Nursing Certification (CCRN)">
                        Critical Care Nursing Certification (CCRN)
                      </option>
                      <option value="Geriatric Nursing Certification (GNC)">
                        Geriatric Nursing Certification (GNC)
                      </option>
                      <option value="Pediatric Nursing Certification (CPN)">
                        Pediatric Nursing Certification (CPN)
                      </option>
                      <option value="Postgraduate Diploma in Nursing">
                        Postgraduate Diploma in Nursing
                      </option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label
                      className="font-bold"
                      style={{ fontFamily: "'Ubuntu', sans-serif" }}
                    >
                      Email
                    </Form.Label>
                    <Form.Control
                      placeholder="Enter Email"
                      className="border-2 border-black"
                      style={{
                        fontFamily: "'Montserrat', serif",
                        fontSize: "15px",
                      }}
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label
                      className="font-bold"
                      style={{ fontFamily: "'Ubuntu', sans-serif" }}
                    >
                      Department Id
                    </Form.Label>
                    <Form.Select
                      style={{
                        fontFamily: "'Montserrat', serif",
                        fontSize: "15px",
                      }}
                      className="border-2 border-black"
                      aria-label="Default select example"
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                    >
                      <option value="">Select Department Id</option>
                      {departmentIds.map((depId) => (
                        <option key={depId} value={depId}>
                          {depId}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label
                      className="font-bold"
                      style={{ fontFamily: "'Ubuntu', sans-serif" }}
                    >
                      Department Name
                    </Form.Label>
                    <Form.Control
                      className="border-2 border-black"
                      style={{
                        fontFamily: "'Montserrat', serif",
                        fontSize: "15px",
                      }}
                      type="text"
                      value={departmentName}
                      readOnly
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  style={{
                    fontFamily: "'Montserrat', serif",
                    fontSize: "15px",
                    fontWeight: "600",
                  }}
                  className="font-bold"
                  variant="primary"
                  onClick={handleAddNurse}
                >
                  Save
                </Button>
                <Button
                  style={{
                    fontFamily: "'Montserrat', serif",
                    fontSize: "15px",
                    fontWeight: "600",
                  }}
                  className="font-bold"
                  variant="success"
                  onClick={handleUpdateNurse}
                >
                  Update
                </Button>
                <Button
                  style={{
                    fontFamily: "'Montserrat', serif",
                    fontSize: "15px",
                    fontWeight: "600",
                  }}
                  className="font-bold"
                  variant="secondary"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
            <br />
            <div className="overflow-x-auto overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-md">
              <div className="overflow-x-auto">
                <Table
                  striped
                  bordered
                  hover
                  responsive
                  className="w-full text-center border border-gray-300"
                >
                  <thead className="bg-red-500 text-white">
                    <tr
                      className="font-bold"
                      style={{ fontFamily: "'Ubuntu', sans-serif" }}
                    >
                      <th className="px-4 py-2 border">Nurse ID</th>
                      <th className="px-4 py-2 border">Full Name</th>

                      <th className="px-4 py-2 border">Gender</th>
                      <th className="px-4 py-2 border">Phone</th>
                      <th className="px-4 py-2 border">Qualification</th>
                      <th className="px-4 py-2 border">Email</th>
                      <th className="px-4 py-2 border">DepartmentId</th>
                      <th className="px-4 py-2 border">Action</th>
                    </tr>
                  </thead>
                  <tbody
                    style={{
                      fontFamily: "'Montserrat', serif",
                      fontSize: "14px",
                      fontWeight: "400",
                    }}
                  >
                    {nurses.map((nurse) => (
                      <tr
                        key={nurse.nurseId}
                        onClick={() => handleEditNurse(nurse)}
                        className="hover:bg-blue-100 transition-all"
                      >
                        <td className="px-4 py-2 border">{nurse.nurseId}</td>
                        <td className="px-4 py-2 border">{nurse.nurseName}</td>

                        <td className="px-4 py-2 border">{nurse.gender}</td>
                        <td className="px-4 py-2 border">
                          {nurse.contactNumber}
                        </td>
                        <td className="px-4 py-2 border">
                          {nurse.qualification}
                        </td>
                        <td className="px-4 py-2 border">{nurse.email}</td>
                        <td className="px-4 py-2 border">
                          {nurse.departmentId}
                        </td>
                        <td className="px-4 py-2 border flex justify-center gap-2 h-[80px]">
                          <button
                            className="bg-red-500 text-white px-3 h-[40px] py-1 rounded-md hover:bg-red-700"
                            onClick={(event) =>
                              handleDeleteNurse(event, nurse.nurseId)
                            }
                          >
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

export default NurseSection;
