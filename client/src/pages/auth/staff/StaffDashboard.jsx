import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, user } from "../../../firebase/Firebase";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import {
  config,
  signInAuth,
} from "../../../firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signOut,
  getAuth,
} from "firebase/auth";

import RequiredAsterisk from "./patientForm/components/asterisk";
import emailjs, { send } from "emailjs-com";
import FamilyHistory from "./patientForm/components/FamilyHistory";
import PersonalMedicalHistory from "./patientForm/components/PersonalMedicalHistory";
import Vaccination from "./patientForm/components/Vaccination";

import patientIco from "./patient.png";
import outPatientIco from "./outpatient.png";
import calendarIco from "./calendar.png";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ClinicVisits from "./ClinicVisits";

const searchIcon = (
  <FontAwesomeIcon icon={faMagnifyingGlass} />
);

function StaffDashboard() {
  const [fullName, setFullName] = useState("");
  const [selected, setSelected] = useState("dashboard");
  const [ShowForm, setShowForm] = useState(false);
  const [ShowForm2, setShowForm2] = useState(false);
  const [ShowClinicVisits, setShowClinicVisits] =
    useState(false);
  const [clinicName, setClinicName] = useState("");
  const [clinics, setClinics] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(
    []
  );

  const handleViewMedicalRecordsClick = () => {
    navigate("/test");
  };

  const handleViewPatientForm = () => {
    navigate("/patientform");
  };

  function changeSelected(selected) {
    setSelected(selected);
  }

  useEffect(() => {
    try {
      async function getPatientDoc() {
        const unsubscribe = onAuthStateChanged(
          config.auth,
          async (user) => {
            if (user) {
              const docRef = doc(
                db,
                "clinicStaffs",
                user.uid
              );
              const docSnap = await getDoc(docRef);
              try {
                const clinicName =
                  docSnap.data().clinicName;
                setClinics(clinicName);
                setClinicName(clinicName);
                const docRefClinic = doc(
                  db,
                  clinicName,
                  "staff",
                  "staffList",
                  user.uid
                );
                const docSnapClinic = await getDoc(
                  docRefClinic
                );
                if (docSnapClinic.exists()) {
                  setFullName(
                    docSnapClinic.data().firstname +
                      " " +
                      docSnapClinic.data().lastname
                  );
                } else {
                  console.log("No such document!");
                }
              } catch (error) {
                console.log("Processing");
              }
            }
          }
        );
      }
      getPatientDoc();
    } catch (error) {
      console.log(error);
    }
  });

  // FORMS
  // FORM
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    emailFormatted: "",
    password: "",
    clinicName: "",
    phoneNumber: "",
    streetAddress: "",
    sex: "",
    bloodType: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    allergies: "",
    relativeName: "",
    relationshipWithRelative: "",
    relativeCondition: "",
    relativeMedications: "",

    vaccineType: "",
    vaccineBrand: "",
    vaccineDate: "",
    vaccineRemarks: "",

    historyType: "",
    historyDate: "",
    historyRemarks: "",
  });
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [sex, setSex] = useState("Male");
  const [bloodType, setBloodType] = useState("A+");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emergencyContactName, setEmergencyContactName] =
    useState("");
  const [
    emergencyContactNumber,
    setEmergencyContactNumber,
  ] = useState("");
  const [allergies, setAllergies] = useState("");

  const [relativeName, setRelativeName] = useState("");
  const [
    relationshipWithRelative,
    setRelationshipWithRelative,
  ] = useState("");
  const [relativeCondition, setRelativeCondition] =
    useState("");
  const [relativeMedications, setRelativeMedications] =
    useState("");

  const [vaccineType, setVaccineType] = useState("");
  const [vaccineBrand, setVaccineBrand] = useState("");
  const [vaccineDate, setVaccineDate] = useState("");
  const [vaccineRemarks, setVaccineRemarks] = useState("");

  const [historyType, setHistoryType] = useState("");
  const [historyDate, setHistoryDate] = useState("");
  const [historyRemarks, setHistoryRemarks] = useState("");

  async function initializeClinic(e) {
    e.preventDefault();

    /*const firstName = e.target['first-name'].value;
        const middleName = e.target['middle-name'].value;
        const lastName = e.target['last-name'].value;
        const email = e.target['email'].value;
        const password = e.target['password'].value;
        const phoneNumber = e.target['number'].value;
        const streetAddress = e.target['street-address'].value;
        const sex = e.target['sex'].value;
        const bloodtype = e.target['bloodtype'].value;
        const emergencyContactName = e.target['emergencyContactName'].value;
        const emergencyContactNumber = e.target['emergencyContactNumber'].value;
        const allergies = e.target['allergies'].value;*/
    const emailFormatted = email;

    setFormData({
      ...formData,
      firstName,
      middleName,
      lastName,
      email,
      emailFormatted,
      password,
      phoneNumber,
      streetAddress,
      sex,
      bloodType,
      emergencyContactName,
      emergencyContactNumber,
      allergies,

      relativeName,
      relationshipWithRelative,
      relativeCondition,
      relativeMedications,

      vaccineType,
      vaccineBrand,
      vaccineDate,
      vaccineRemarks,

      historyType,
      historyDate,
      historyRemarks,
    });
  }

  const [selectedPatient, setSelectedPatient] =
    useState("");

  const [loading, setLoading] = useState(true); // Initial loading state
  const [patientList, setPatientList] = useState([]);

  useEffect(() => {
    async function fetchPatients() {
      if (clinicName) {
        try {
          const tempRecords = [];
          const patientsCollectionRef = collection(
            config.firestore,
            clinicName,
            "patients",
            "patientlist"
          );
          const patientsQueried = query(
            patientsCollectionRef
          );
          const querySnapshot = await getDocs(
            patientsQueried
          );

          console.log(querySnapshot.docs);

          for (const doc of querySnapshot.docs) {
            const baselineInformationCollectionRef =
              collection(
                config.firestore,
                clinicName,
                "patients",
                "patientlist",
                doc.id,
                "baselineInformation"
              );
            const baselineInformationSnapshot =
              await getDocs(
                baselineInformationCollectionRef
              );

            baselineInformationSnapshot.forEach(
              (baselineDoc) => {
                const data = baselineDoc.data();
                data.uid = doc.id;
                tempRecords.push(data);
              }
            );
          }
          setPatientList(tempRecords);
          setLoading(false);
        } catch (error) {
          console.error(
            "Error getting documents from patientlist collection:",
            error
          );
        }
      }
    }

    fetchPatients();
  }, [clinicName]);

  const [formData2, setFormData2] = useState({
    SelectedPatient: "",
    UID: "",
    Temperature: "",
    clinicName2: "",
    Assessment: "",
    Treatment: "",
    MensDate: "",
    HeartRate: "",
    Weight: "",
    Height: "",
    RespiratoryRate: "",
    BP: "",
    chief_complaint: "",
    Disposition: "",
    sex2: "",
    TypeofPatient: "",
    VisitDate: "",
    FollowUpDate: "",
    notes: "",
  });
  const [UID, setUID] = useState();
  const [Fullname, SetFullName] = useState("");
  const [sex2, setSex2] = useState("Male");
  const [TypeofPatient, setTypeofPatient] = useState("New");
  const [Assessment, setAssessment] = useState("");
  const [Treatment, setTreatment] = useState("");
  const [MensDate, setMensDate] = useState("");
  const [Weight, setWeight] = useState("");
  const [Height, setHeight] = useState("");
  const [BP, setBP] = useState("");
  const [RespiratoryRate, setRespiratoryRate] =
    useState("");
  const [HeartRate, setHeartRate] = useState("");
  const [chief_complaint, setchief_complaint] =
    useState("");
  const [Disposition, setDisposition] = useState("");
  const [Temperature, setTemperature] = useState("");
  const [VisitDate, setVisitDate] = useState("");
  const [FollowUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");

  async function initializeClinic2(e) {
    e.preventDefault();

    /*const firstName = e.target['first-name'].value;
        const middleName = e.target['middle-name'].value;
        const lastName = e.target['last-name'].value;
        const email = e.target['email'].value;
        const password = e.target['password'].value;
        const phoneNumber = e.target['number'].value;
        const streetAddress = e.target['street-address'].value;
        const sex = e.target['sex'].value;
        const bloodtype = e.target['bloodtype'].value;
        const emergencyContactName = e.target['emergencyContactName'].value;
        const emergencyContactNumber = e.target['emergencyContactNumber'].value;
        const allergies = e.target['allergies'].value;*/

    setFormData2({
      ...formData2,
      UID,
      Temperature,
      BP,
      Assessment,
      Treatment,
      MensDate,
      HeartRate,
      RespiratoryRate,
      Weight,
      Height,
      chief_complaint,
      Disposition,
      sex2,
      TypeofPatient,
      VisitDate,
      FollowUpDate,
      notes,
    });
  }

  useEffect(() => {
    if (patientList.length > 0) {
      setUID(patientList[0].uid);
    }
  }, [patientList]);

  // functions for getting family history
  function getRelativeFullName(fullname) {
    setRelativeName(fullname);
  }

  function getRelationshipWithRelative(relationship) {
    setRelationshipWithRelative(relationship);
  }

  function getRelativeCondition(condition) {
    setRelativeCondition(condition);
  }

  function getRelativeMedications(medications) {
    setRelativeMedications(medications);
  }

  // functions for getting vaccination
  function getVaccineType(vaccineType) {
    setVaccineType(vaccineType);
  }

  function getVaccineBrand(vaccineBrand) {
    setVaccineBrand(vaccineBrand);
  }

  function getVaccineDate(vaccineDate) {
    setVaccineDate(vaccineDate);
  }

  function getVaccineRemarks(vaccineRemarks) {
    setVaccineRemarks(vaccineRemarks);
  }

  // functions for getting Personal Medical History
  function getHistoryType(historyType) {
    setHistoryType(historyType);
  }

  function getHistoryDate(historyDate) {
    setHistoryDate(historyDate);
  }

  function getHistoryRemarks(historyRemarks) {
    setHistoryRemarks(historyRemarks);
  }

  useEffect(() => {
    if (formData.email) {
      try {
        // EMAIL CREDENTIALS
        function sendEmail() {
          emailjs
            .send(
              "service_wck5i1f",
              "template_x65vfmj",
              formData,
              "ylfQTgllFvn4pU4Yw"
            )
            .then(
              (result) => {
                alert("Email sent successfully!");
              },
              (error) => {
                console.error("Email error:", error.text);
                alert("Failed to send email.");
              }
            );
        }

        getDoc(
          doc(
            config.firestore,
            "clinicStaffs",
            config.auth.currentUser.uid
          )
        )
          .then((docSnapshot) => {
            if (docSnapshot.exists()) {
              // The document exists
              const data = docSnapshot.data();
              console.log("Document data:", data);

              // Now you can access individual fields within the document
              const clinicName = data.clinicName;
              createUserWithEmailAndPassword(
                signInAuth.auth,
                formData.emailFormatted,
                formData.password
              )
                .then((userCredential) => {
                  setDoc(
                    doc(
                      config.firestore,
                      "clinicPatient",
                      userCredential.user.uid
                    ),
                    {
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      email: formData.email,
                    }
                  );
                  setDoc(
                    doc(
                      config.firestore,
                      "clinicPatient",
                      userCredential.user.uid,
                      "clinics",
                      clinicName
                    ),
                    {
                      clinicName: clinicName,
                    }
                  );
                  console.log(formData);
                  // TODO: ADD INPATIENT INFORMATION
                  addDoc(
                    collection(
                      config.firestore,
                      clinicName,
                      "patients",
                      "patientlist",
                      userCredential.user.uid,
                      "baselineInformation"
                    ),
                    {
                      firstname: formData.firstName,
                      middleName: formData.middleName,
                      lastname: formData.lastName,
                      email: formData.email,
                      phoneNumber: formData.phoneNumber,
                      streetAddress: formData.streetAddress,
                      sex: formData.sex,
                      bloodType: formData.bloodType,
                      emergencyContactName:
                        formData.emergencyContactName,
                      emergencyContactNumber:
                        formData.emergencyContactNumber,
                      allergies: formData.allergies,

                      relativeName: formData.relativeName,
                      relationshipWithRelative:
                        formData.relationshipWithRelative,
                      relativeCondition:
                        formData.relativeCondition,
                      relativeMedications:
                        formData.relativeMedications,

                      vaccineType: formData.vaccineType,
                      vaccineBrand: formData.vaccineBrand,
                      vaccineDate: formData.vaccineDate,
                      vaccineRemarks:
                        formData.vaccineRemarks,

                      historyType: formData.historyType,
                      historyDate: formData.historyDate,
                      historyRemarks:
                        formData.historyRemarks,
                    }
                  );

                  setDoc(
                    doc(
                      config.firestore,
                      clinicName,
                      "patients",
                      "patientlist",
                      userCredential.user.uid
                    ),
                    {
                      identifier: "identifier",
                    }
                  );
                  //

                  sendEmail();
                  // SignOut 2nd authentication
                  signOut(signInAuth.auth)
                    .then(() => {
                      // Sign-out successful.
                    })
                    .catch((error) => {
                      // An error happened.
                    });
                  // ...
                })
                .catch((error) => {
                  console.error(
                    "Error creating user:",
                    error.message
                  );
                  const errorCode = error.code;
                  const errorMessage = error.message;
                  // ..
                  console.log(
                    errorCode + " | " + errorMessage
                  );
                  if (
                    errorCode == "auth/email-already-in-use"
                  ) {
                    alert("Invalid email address");
                  } else if (
                    errorCode == "auth/weak-password"
                  ) {
                    alert("Password is too weak");
                  }
                });
            } else {
              console.log("Document does not exist");
            }
          })
          .catch((error) => {
            console.error("Error getting document:", error);
          });

        resetForm();
        setShowForm(false);
      } catch (error) {
        console.error("Error initializing clinic:", error);
      }
    }
  }, [formData]);

  useEffect(() => {
    for (let i = 0; i < patientList.length; i++) {
      if (patientList[i].uid == UID) {
        SetFullName(
          patientList[i].lastname +
            ", " +
            patientList[i].firstname
        );
      }
    }
  });

  useEffect(() => {
    if (formData2.UID) {
      try {
        getDoc(
          doc(
            config.firestore,
            "clinicStaffs",
            config.auth.currentUser.uid
          )
        )
          .then((docSnapshot) => {
            if (docSnapshot.exists()) {
              // The document exists
              const data = docSnapshot.data();
              console.log("Document data:", data);

              // Now you can access individual fields within the document
              const clinicName = data.clinicName;

              console.log(Fullname);
              if (Fullname) {
                addDoc(
                  collection(
                    config.firestore,
                    clinicName,
                    "patients",
                    "patientlist",
                    formData2.UID,
                    "diagnoses"
                  ),
                  {
                    Name: Fullname,
                    Temperature: formData2.Temperature,
                    BP: formData2.BP,
                    Assessment: formData2.Assessment,
                    Treatment: formData2.Treatment,
                    ChiefComplaint:
                      formData2.chief_complaint,
                    Sex: sex2,
                    Disposition: formData2.Disposition,
                    LastMensDate: formData2.MensDate,
                    RespiratoryRate:
                      formData2.RespiratoryRate,
                    Height: formData2.Height,
                    Weight: formData2.Weight,
                    HeartRate: formData2.HeartRate,
                    Patienttype: TypeofPatient,
                    VisitDate: formData2.VisitDate,
                    FollowUpDate: formData2.FollowUpDate,
                    ProviderNotes: formData2.notes,
                    Clinic: clinicName,
                  }
                );
              }
            } else {
              console.log("Document does not exist");
            }
          })
          .catch((error) => {
            console.error("Error getting document:", error);
          });

        resetForm2();
        setShowForm2(false);
      } catch (error) {
        console.error("Error initializing clinic:", error);
      }
    }
  }, [formData2]);

  function resetForm() {
    setFirstName("");
    setMiddleName("");
    setLastName("");

    setSex("Male");
    setBloodType("A+");
    setPhoneNumber("");
    setStreetAddress("");
    setEmail("");
    setPassword("");
    setEmergencyContactName("");
    setEmergencyContactNumber("");
    setAllergies("");

    setRelativeName("");
    setRelationshipWithRelative("");
    setRelativeCondition("");
    setRelativeMedications("");

    setVaccineType("");
    setVaccineBrand("");
    setVaccineDate("");
    setVaccineRemarks("");

    setHistoryType("");
    setHistoryDate("");
    setHistoryRemarks("");
  }

  function resetForm2() {
    setUID("");
    setTemperature("");
    setBP("");
    setAssessment("");
    setTreatment("");
    setMensDate("");
    setHeartRate("");
    setRespiratoryRate("");
    setWeight("");
    setHeight("");
    setchief_complaint("");
    setDisposition("");
    setSex2("Male");
    setTypeofPatient("New");
    setVisitDate("");
    setFollowUpDate("");
    setNotes("");
    setCurrentPage2(1);
  }

  function handleSelectPatient(patientUID) {
    setUID(patientUID);
    setCurrentPage2(2);
  }

  function closeOutpatient() {
    setCurrentPage2(1);
    setShowForm2(false);
  }

  const handleSearchInputChange = (e) => {
    const { value } = e.target;
    setSearchText(value);

    // Filter patient list based on input text
    const filtered = patientList.filter(
      (patient) =>
        patient.firstname
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        patient.lastname
          .toLowerCase()
          .includes(value.toLowerCase())
    );
    setFilteredPatients(filtered);
  };

  return (
    <>
      <div
        className="h-screen w-full flex overflow-hidden"
        style={{ backgroundColor: "#dcdef3" }}
      >
        <Sidebar
          selected={selected}
          name={fullName}
          changeSelected={changeSelected}
        />
        {selected == "dashboard" ? (
          <div
            style={{
              float: "left",
              width: "100vh",
              height: "100vh",
              marginLeft: "12vw",
              marginTop: "9vh",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                className="text-black text-3xl font-semibold"
                style={{ marginLeft: "5vw" }}
              >
                WELCOME BACK, {fullName}!
              </span>
              <div
                style={{
                  width: "60vw",
                  height: "40vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  onClick={() => {
                    navigate("patientlist");
                  }}
                  className="Pdashboard-Card-BoxShadow"
                  style={{
                    border: "2px solid #00008B",
                    width: "30%",
                    height: "85%",
                    borderRadius: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    background:
                      "linear-gradient(to bottom right, #2657B7, #A5E4FF)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <span
                      className="text-white text-4xl font-semibold"
                      style={{ letterSpacing: "5px" }}
                    >
                      PATIENTS
                    </span>
                  </div>
                  <div
                    style={{
                      background: `url(${patientIco}) center center no-repeat`,
                      backgroundSize: "cover",
                      width: "100%",
                      height: "100%",
                      borderRadius: "10px",
                    }}
                  ></div>
                </div>

                <div
                  onClick={() =>
                    setShowForm2(
                      (prevShowForm2) => !prevShowForm2
                    )
                  }
                  className="Pdashboard-Card-BoxShadow"
                  style={{
                    border: "2px solid #6f183e",
                    background:
                      "linear-gradient(to bottom right, #E41818, #FB57FE)",
                    width: "30%",
                    height: "85%",
                    borderRadius: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    marginLeft: "8vh",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center", // Add this line to center text within the div
                    }}
                  >
                    <span
                      className="text-white text-4xl font-semibold"
                      style={{ letterSpacing: "5px" }}
                    >
                      OUTPATIENT <br /> FORM
                    </span>
                  </div>
                  <div
                    style={{
                      background: `url(${outPatientIco}) center center no-repeat`,
                      backgroundSize: "cover",
                      width: "100%",
                      height: "100%",
                      borderRadius: "10px",
                    }}
                  ></div>
                </div>
              </div>
              <div
                style={{
                  width: "56vw",
                  height: "40vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  onClick={() =>
                    setSelected("clinic-visits")
                  }
                  className="Pdashboard-Card-BoxShadow"
                  style={{
                    border: "2px solid #6f183e",
                    background:
                      "linear-gradient(to bottom right, #bfd9be, #83b67f)",
                    width: "60%",
                    height: "85%",
                    borderRadius: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    marginLeft: "8vh",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center", // Add this line to center text within the div
                    }}
                  >
                    <span
                      className="text-white text-4xl font-semibold"
                      style={{ letterSpacing: "5px" }}
                    >
                      CLINIC <br /> VISITS
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundSize: "cover",
                      width: "100%",
                      height: "100%",
                      borderRadius: "10px",
                    }}
                  ></div>
                </div>
              </div>
            </div>
            {ShowForm && (
              <div className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="relative w-full max-w-2xl max-h-full mx-auto lato">
                  <div className="flex items-start justify-between p-4 border-b rounded-t bg-blue-800">
                    <h3 className="p-2 text-xl font-semibold text-white-900 dark:text-white">
                      PATIENT INFORMATION FORM
                    </h3>
                    <button
                      className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-slate-50 dark:hover:text-black"
                      onClick={() => setShowForm(false)}
                    >
                      <svg
                        className="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                      </svg>
                      <span className="sr-only">
                        Close modal
                      </span>
                    </button>
                  </div>
                  <div className="relative bg-white shadow shadow-2xl drop-shadow-2xl border border-black">
                    <div className="p-10 space-y-6 text-black">
                      <form
                        className="mx-auto exo"
                        onSubmit={initializeClinic}
                      >
                        <div className="space-y-12 text-black">
                          {currentPage == 1 ? (
                            <div className="border-b border-gray-900/10 pb-12">
                              <h2 className="text-base font-semibold leading-7 text-black">
                                Personal Information
                              </h2>

                              <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-9">
                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="first-name"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    First name{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      name="first-name"
                                      id="first-name"
                                      autoComplete="given-name"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={firstName}
                                      onChange={(e) =>
                                        setFirstName(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="middle-name"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Middle name
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      name="middle-name"
                                      id="middle-name"
                                      autoComplete="middle-name"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={middleName}
                                      onChange={(e) =>
                                        setMiddleName(
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="last-name"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Last name{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      name="last-name"
                                      id="last-name"
                                      autoComplete="family-name"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={lastName}
                                      onChange={(e) =>
                                        setLastName(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-9">
                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="sex"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Sex <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <select
                                      id="sex"
                                      name="sex"
                                      autoComplete="sex"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 p-3"
                                      value={sex}
                                      onChange={(e) =>
                                        setSex(
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option
                                        value="Male"
                                        selected
                                      >
                                        Male
                                      </option>
                                      <option value="Female">
                                        Female
                                      </option>
                                    </select>
                                  </div>
                                </div>

                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="bloodType"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Blood Type{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <select
                                      id="bloodType"
                                      name="bloodType"
                                      autoComplete="bloodType"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 p-3"
                                      value={bloodType}
                                      onChange={(e) =>
                                        setBloodType(
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option selected>
                                        A+
                                      </option>
                                      <option>B+</option>
                                      <option>AB+</option>
                                      <option>O+</option>
                                      <option>A-</option>
                                      <option>B-</option>
                                      <option>AB-</option>
                                      <option>O-</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="number"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Phone number{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      id="number"
                                      name="number"
                                      type="number"
                                      autoComplete="phone number"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={phoneNumber}
                                      onChange={(e) =>
                                        setPhoneNumber(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-9">
                                <div className="col-span-full">
                                  <label
                                    htmlFor="street-address"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Street address{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      name="street-address"
                                      id="street-address"
                                      autoComplete="street-address"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={streetAddress}
                                      onChange={(e) =>
                                        setStreetAddress(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-8">
                                <div className="sm:col-span-4">
                                  <label
                                    htmlFor="email"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Email address{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      id="email"
                                      name="email"
                                      type="email"
                                      autoComplete="email"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={email}
                                      onChange={(e) =>
                                        setEmail(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="sm:col-span-4">
                                  <label
                                    htmlFor="password"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Password{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="password"
                                      name="password"
                                      id="password"
                                      autoComplete="current-password"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={password}
                                      onChange={(e) =>
                                        setPassword(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-8">
                                <div className="sm:col-span-4">
                                  <label
                                    htmlFor="emergencyContactName"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Emergency Contact Name{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      name="emergencyContactName"
                                      id="emergencyContactName"
                                      autoComplete="emergencyContactName"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={
                                        emergencyContactName
                                      }
                                      onChange={(e) =>
                                        setEmergencyContactName(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="sm:col-span-4">
                                  <label
                                    htmlFor="emergencyContactName"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Emergency Contact Phone
                                    Number{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="number"
                                      name="emergencyContactNumber"
                                      id="emergencyContactNumber"
                                      autoComplete="emergencyContactNumber"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={
                                        emergencyContactNumber
                                      }
                                      onChange={(e) =>
                                        setEmergencyContactNumber(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-8">
                                <div className="col-span-full">
                                  <label
                                    htmlFor="allergies"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Allergies
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      name="allergies"
                                      id="allergies"
                                      autoComplete="allergies"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={allergies}
                                      onChange={(e) =>
                                        setAllergies(
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end mt-8">
                                <button
                                  onClick={() =>
                                    setCurrentPage(
                                      currentPage + 1
                                    )
                                  }
                                  className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                  type="button"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}

                          {currentPage == 2 ? (
                            <FamilyHistory
                              relativeFullName={
                                relativeName
                              }
                              relationshipWithRelative={
                                relationshipWithRelative
                              }
                              relativeCondition={
                                relativeCondition
                              }
                              relativeMedications={
                                relativeMedications
                              }
                              getRelativeFullName={
                                getRelativeFullName
                              }
                              getRelationshipWithRelative={
                                getRelationshipWithRelative
                              }
                              getRelativeCondition={
                                getRelativeCondition
                              }
                              getRelativeMedications={
                                getRelativeMedications
                              }
                            />
                          ) : (
                            <></>
                          )}

                          {currentPage == 3 ? (
                            <Vaccination
                              vaccineType={vaccineType}
                              vaccineBrand={vaccineBrand}
                              vaccineDate={vaccineDate}
                              vaccineRemarks={
                                vaccineRemarks
                              }
                              getVaccineType={
                                getVaccineType
                              }
                              getVaccineBrand={
                                getVaccineBrand
                              }
                              getVaccineDate={
                                getVaccineDate
                              }
                              getVaccineRemarks={
                                getVaccineRemarks
                              }
                            />
                          ) : (
                            <></>
                          )}

                          {currentPage == 4 ? (
                            <PersonalMedicalHistory
                              historyType={historyType}
                              historyDate={historyDate}
                              historyRemarks={
                                historyRemarks
                              }
                              getHistoryType={
                                getHistoryType
                              }
                              getHistoryDate={
                                getHistoryDate
                              }
                              getHistoryRemarks={
                                getHistoryRemarks
                              }
                            />
                          ) : (
                            <></>
                          )}

                          {currentPage >= 2 &&
                          currentPage <= 3 ? (
                            <div className="flex justify-between mt-8">
                              <div className="inline">
                                <button
                                  onClick={() =>
                                    setCurrentPage(
                                      currentPage - 1
                                    )
                                  }
                                  className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                  type="button"
                                >
                                  Back
                                </button>
                              </div>

                              <div className="inline">
                                <button
                                  onClick={() =>
                                    setCurrentPage(
                                      currentPage + 1
                                    )
                                  }
                                  className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                  type="button"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}

                          {currentPage == 4 ? (
                            <div className="flex justify-between mt-8">
                              <div className="inline">
                                <button
                                  onClick={() =>
                                    setCurrentPage(
                                      currentPage - 1
                                    )
                                  }
                                  className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                  type="button"
                                >
                                  Back
                                </button>
                              </div>
                              <div className="inline">
                                <button
                                  className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                  type="submit"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {ShowForm2 && (
              <div className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full shadow-2xl drop-shadow-2xl border border-black">
                <div className="relative w-full max-w-2xl max-h-full mx-auto">
                  {currentPage2 == 1 ? (
                    <div>
                      <div className="flex items-start justify-between p-4 border-b rounded-t bg-blue-800">
                        <h3 className="text-xl font-semibold text-white-900 dark:text-white">
                          Select a Patient
                        </h3>
                        <button
                          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-slate-50 dark:hover:text-black"
                          onClick={(e) => closeOutpatient()}
                        >
                          <svg
                            className="w-3 h-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                          >
                            <path
                              stroke="currentColor"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                          </svg>
                          <span className="sr-only">
                            Close modal
                          </span>
                        </button>
                      </div>
                      <div className="relative bg-slate-50 shadow exo p-10 space-y-2 lato">
                        <div className="mb-7">
                          <h1 className="text-xl font-semibold text-white-900 exo mb-2">
                            Search Patient
                          </h1>
                          <input
                            type="text"
                            className="ext-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                            value={searchText}
                            onChange={
                              handleSearchInputChange
                            }
                          />
                        </div>
                        {/* Render filtered patient list */}
                        {searchText !== ""
                          ? filteredPatients.map(
                              (patient, index) => (
                                <div
                                  className="uppercase justify-between flex"
                                  key={index}
                                >
                                  {patient.lastname},{" "}
                                  {patient.firstname}
                                  <button
                                    className="bg-blue-600 p-2 rounded-xl drop-shadow-2xl shadow-2xl text-white"
                                    onClick={() =>
                                      handleSelectPatient(
                                        patient.uid
                                      )
                                    }
                                  >
                                    Select
                                  </button>
                                </div>
                              )
                            )
                          : patientList.map(
                              (patient, index) => (
                                <div
                                  className="uppercase justify-between flex"
                                  key={index}
                                >
                                  {patient.lastname},{" "}
                                  {patient.firstname}
                                  <button
                                    className="bg-blue-600 p-2 rounded-xl drop-shadow-2xl shadow-2xl text-white"
                                    onClick={() =>
                                      handleSelectPatient(
                                        patient.uid
                                      )
                                    }
                                  >
                                    Select
                                  </button>
                                </div>
                              )
                            )}
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}

                  {currentPage2 == 2 ? (
                    <div>
                      <div className="flex items-start justify-between p-4 border-b rounded-t bg-blue-800">
                        <h3 className="text-xl font-semibold text-white-900 dark:text-white">
                          Outpatient Form
                        </h3>
                        <button
                          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-slate-50 dark:hover:text-black"
                          onClick={(e) => closeOutpatient()}
                        >
                          <svg
                            className="w-3 h-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                          >
                            <path
                              stroke="currentColor"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                          </svg>
                          <span className="sr-only">
                            Close modal
                          </span>
                        </button>
                      </div>

                      <div className="relative bg-slate-50 shadow exo">
                        <div className="p-6 space-y-6">
                          <form
                            onSubmit={initializeClinic2}
                          >
                            <h1 className="exo">
                              {Fullname}
                            </h1>
                            <div className="border-b border-gray-900/10 pb-12">
                              <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-9">
                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="ChiefComplaint"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Chief Complaint{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      name="ChiefComplaint"
                                      id="ChiefComplaint"
                                      autoComplete="ChiefComplaint"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={
                                        chief_complaint
                                      }
                                      onChange={(e) =>
                                        setchief_complaint(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="Assessment"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Assessment{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      id="Assessment"
                                      name="Assessment"
                                      autoComplete="Assessment"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 p-3"
                                      value={Assessment}
                                      onChange={(e) =>
                                        setAssessment(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="Treatment"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Treatment{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      id="Treatment"
                                      name="Treatment"
                                      autoComplete="Treatment"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 p-3"
                                      value={Treatment}
                                      onChange={(e) =>
                                        setTreatment(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-9">
                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="sex"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Sex <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <select
                                      id="sex2"
                                      name="sex2"
                                      autoComplete="sex"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 p-3"
                                      value={sex2}
                                      defaultValue={"Male"}
                                      onChange={(e) =>
                                        setSex2(
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option
                                        value="Male"
                                        selected
                                      >
                                        Male
                                      </option>
                                      <option value="Female">
                                        Female
                                      </option>
                                    </select>
                                  </div>
                                </div>

                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="patienttype"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Type of Patient{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <select
                                      id="patienttype"
                                      name="patienttype"
                                      autoComplete="patienttype"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 p-3"
                                      value={TypeofPatient}
                                      defaultValue={"New"}
                                      onChange={(e) =>
                                        setTypeofPatient(
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option>New</option>
                                      <option>
                                        Existing
                                      </option>
                                    </select>
                                  </div>
                                </div>

                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="number2"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    BP <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      id="number2"
                                      name="number2"
                                      type="number"
                                      autoComplete="phone number"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={BP}
                                      onChange={(e) =>
                                        setBP(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-8">
                                <div className="sm:col-span-4">
                                  <label
                                    htmlFor="Height"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Height{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="number"
                                      id="Height"
                                      name="Height"
                                      autoComplete="Height"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 p-3"
                                      value={Height}
                                      onChange={(e) =>
                                        setHeight(
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="sm:col-span-4">
                                  <label
                                    htmlFor="Weight"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Weight{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="number"
                                      id="Weight"
                                      name="Weight"
                                      autoComplete="Weight"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 p-3"
                                      value={Weight}
                                      onChange={(e) =>
                                        setWeight(
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-9">
                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="HeartRate"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Heart Rate{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="number"
                                      name="HeartRate"
                                      id="HeartRate"
                                      autoComplete="HeartRate"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={HeartRate}
                                      onChange={(e) =>
                                        setHeartRate(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="RespiratoryRate"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Respiratory Rate{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="number"
                                      name="RespiratoryRate"
                                      id="RespiratoryRate"
                                      autoComplete="RespiratoryRate"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={
                                        RespiratoryRate
                                      }
                                      onChange={(e) =>
                                        setRespiratoryRate(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="Temperature"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Temperature{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      id="Temperature"
                                      name="Temperature"
                                      type="number"
                                      autoComplete="Temperature"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={Temperature}
                                      onChange={(e) =>
                                        setTemperature(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-8">
                                <div className="sm:col-span-4">
                                  <label
                                    htmlFor="Disposition"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Disposition
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="Disposition"
                                      name="Disposition"
                                      id="Disposition"
                                      autoComplete="Disposition"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={Disposition}
                                      onChange={(e) =>
                                        setDisposition(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="sm:col-span-4">
                                  <label
                                    htmlFor="MensDate"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Last Menstruation Date
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="date"
                                      name="MensDate"
                                      id="MensDate"
                                      autoComplete="MensDate"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={MensDate}
                                      onChange={(e) =>
                                        setMensDate(
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-8">
                                <div className="sm:col-span-4">
                                  <label
                                    htmlFor="VisitDate"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Visit Date{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="date"
                                      name="VisitDate"
                                      id="VisitDate"
                                      autoComplete="VisitDate"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={VisitDate}
                                      onChange={(e) =>
                                        setVisitDate(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="sm:col-span-4">
                                  <label
                                    htmlFor="FollowUpDate"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Follow Up Date{" "}
                                    <RequiredAsterisk />
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="date"
                                      name="FollowUpDate"
                                      id="FollowUpDate"
                                      autoComplete="FollowUpDate"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={FollowUpDate}
                                      onChange={(e) =>
                                        setFollowUpDate(
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-8">
                                <div className="col-span-full">
                                  <label
                                    htmlFor="allergies"
                                    className="block text-sm font-medium leading-6 text-black"
                                  >
                                    Provider Notes
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      name="Provider Notes"
                                      id="Provider Notes"
                                      autoComplete="Provider Notes"
                                      className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                      value={notes}
                                      onChange={(e) =>
                                        setNotes(
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-10 flex justify-between">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCurrentPage2(1)
                                  }
                                  className="rounded-md bg-indigo-600 p-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                  Back
                                </button>
                                <button className="rounded-md bg-indigo-600 p-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                  Submit
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <></>
        )}

        {selected == "clinic-visits" ? (
          <ClinicVisits changeSelected={changeSelected} />
        ) : (
          <></>
        )}

        {selected == "profile" ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              marginLeft: "13vw",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "60vw",
                height: "60vh",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background:
                    "linear-gradient(to bottom right, #2657B7, #A5E4FF)",
                  borderRadius: "20px",
                  boxShadow:
                    "0px 0px 10px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div
                  onClick={() =>
                    setShowForm(
                      (prevShowForm) => !prevShowForm
                    )
                  }
                  className="Pdashboard-Card-BoxShadow"
                  style={{
                    border: "2px solid #00008B",
                    width: "80%",
                    height: "80%",
                    borderRadius: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "white",
                    padding: "20px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                    }}
                  >
                    Fullname: {fullName}
                  </p>
                  <p style={{ fontSize: "18px" }}>Sex: </p>
                  <p style={{ fontSize: "18px" }}>Age: </p>
                  <p style={{ fontSize: "18px" }}>
                    Clinic: {clinics}
                  </p>
                  <p style={{ fontSize: "18px" }}>
                    Position: Clinic Staff
                  </p>
                  <p style={{ fontSize: "18px" }}>
                    Birthday:{" "}
                  </p>
                  <p style={{ fontSize: "18px" }}>
                    Address:{" "}
                  </p>
                  <p style={{ fontSize: "18px" }}>
                    Email:{" "}
                  </p>
                  <p style={{ fontSize: "18px" }}>
                    Contact Number:{" "}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}

        {selected == "inbox" ? (
          <main class="flex w-full h-full shadow-lg rounded-3xl">
            <section class="flex flex-col w-2/12 bg-white">
              <div class="w-16 mx-auto mt-12 mb-20 p-4 bg-indigo-600 rounded-2xl text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                  />
                </svg>
              </div>
              <nav class="relative flex flex-col py-4 items-center">
                <a
                  href="#"
                  class="relative w-16 p-4 bg-purple-100 text-purple-900 rounded-2xl mb-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1"
                      d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
                    />
                  </svg>
                  <span class="absolute -top-2 -right-2 bg-red-600 h-6 w-6 p-2 flex justify-center items-center text-white rounded-full">
                    3
                  </span>
                </a>
                <a
                  href="#"
                  class="w-16 p-4 border text-gray-700 rounded-2xl mb-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  class="w-16 p-4 border text-gray-700 rounded-2xl mb-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  class="w-16 p-4 border text-gray-700 rounded-2xl mb-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  class="w-16 p-4 border text-gray-700 rounded-2xl mb-24"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  class="w-16 p-4 border text-gray-700 rounded-2xl"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </a>
              </nav>
            </section>
            <section class="flex flex-col pt-3 w-4/12 bg-gray-50 h-full overflow-y-scroll">
              <label class="px-3">
                <input
                  class="rounded-lg p-4 bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 w-full"
                  placeholder="Search..."
                />
              </label>

              <ul class="mt-6">
                <li class="py-5 border-b px-3 transition hover:bg-indigo-100">
                  <a
                    href="#"
                    class="flex justify-between items-center"
                  >
                    <h3 class="text-lg font-semibold">
                      {fullName}
                    </h3>
                    <p class="text-md text-gray-400">
                      23m ago
                    </p>
                  </a>
                  <div class="text-md italic text-gray-400">
                    Patient Appointment Reminder!
                  </div>
                </li>
                <li class="py-5 border-b px-3 transition hover:bg-indigo-100">
                  <a
                    href="#"
                    class="flex justify-between items-center"
                  >
                    <h3 class="text-lg font-semibold">
                      {fullName}
                    </h3>
                    <p class="text-md text-gray-400">
                      23m ago
                    </p>
                  </a>
                  <div class="text-md italic text-gray-400">
                    Patient Appointment Reminder!
                  </div>
                </li>
                <li class="py-5 border-b px-3 transition hover:bg-indigo-100">
                  <a
                    href="#"
                    class="flex justify-between items-center"
                  >
                    <h3 class="text-lg font-semibold">
                      {fullName}
                    </h3>
                    <p class="text-md text-gray-400">
                      23m ago
                    </p>
                  </a>
                  <div class="text-md italic text-gray-400">
                    Patient Appointment Reminder!
                  </div>
                </li>
                <li class="py-5 border-b px-3 transition hover:bg-indigo-100">
                  <a
                    href="#"
                    class="flex justify-between items-center"
                  >
                    <h3 class="text-lg font-semibold">
                      {fullName}
                    </h3>
                    <p class="text-md text-gray-400">
                      23m ago
                    </p>
                  </a>
                  <div class="text-md italic text-gray-400">
                    Patient Appointment Reminder!
                  </div>
                </li>
                <li class="py-5 border-b px-3 bg-indigo-600 text-white">
                  <a
                    href="#"
                    class="flex justify-between items-center"
                  >
                    <h3 class="text-lg font-semibold">
                      {fullName}
                    </h3>
                    <p class="text-md">23m ago</p>
                  </a>
                  <div class="text-md">
                    Patient Appointment Reminder!
                  </div>
                </li>
                <li class="py-5 border-b px-3 transition hover:bg-indigo-100">
                  <a
                    href="#"
                    class="flex justify-between items-center"
                  >
                    <h3 class="text-lg font-semibold">
                      {fullName}
                    </h3>
                    <p class="text-md text-gray-400">
                      23m ago
                    </p>
                  </a>
                  <div class="text-md italic text-gray-400">
                    Patient Appointment Reminder!
                  </div>
                </li>
                <li class="py-5 border-b px-3 transition hover:bg-indigo-100">
                  <a
                    href="#"
                    class="flex justify-between items-center"
                  >
                    <h3 class="text-lg font-semibold">
                      {fullName}
                    </h3>
                    <p class="text-md text-gray-400">
                      23m ago
                    </p>
                  </a>
                  <div class="text-md italic text-gray-400">
                    Patient Appointment Reminder!
                  </div>
                </li>
              </ul>
            </section>
            <section class="w-6/12 px-4 flex flex-col bg-white rounded-r-3xl">
              <div class="flex justify-between items-center h-48 border-b-2 mb-8">
                <div class="flex space-x-4 items-center">
                  <div class="h-12 w-12 rounded-full overflow-hidden">
                    <img
                      src="https://bit.ly/2KfKgdy"
                      loading="lazy"
                      class="h-full w-full object-cover"
                    />
                  </div>
                  <div class="flex flex-col">
                    <h3 class="font-semibold text-lg">
                      Alexandar Gomez
                    </h3>
                    <p class="text-light text-gray-400">
                      AlexGomez@gmail.com
                    </p>
                  </div>
                </div>
                <div>
                  <ul class="flex text-gray-400 space-x-4">
                    <li class="w-6 h-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                        />
                      </svg>
                    </li>
                    <li class="w-6 h-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </li>

                    <li class="w-6 h-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                    </li>
                    <li class="w-6 h-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </li>
                    <li class="w-6 h-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </li>
                  </ul>
                </div>
              </div>
              <section>
                <h1 class="font-bold text-2xl">
                  Shuan Co | Patient Appointment | Heart
                  Surgery Required
                </h1>
                <article class="mt-8 text-gray-500 leading-7 tracking-wider">
                  <p>Hi {fullName},</p>
                  <p>
                    I hope this email finds you well. I
                    wanted to reach out to you with some
                    important medical information regarding
                    the patient's recent examination and
                    test results. After a thorough
                    evaluation, our medical team has
                    determined that you require immediate
                    attention due to a significant heart
                    condition. It has been advised by our
                    expert cardiologists that the patient
                    undergo heart surgery without any
                    further delay. The procedure we
                    recommend is known as Coronary Artery
                    Bypass Grafting (CABG) to address the
                    blockages in your coronary arteries.
                    This surgery is essential to ensure the
                    proper blood supply to the patient's
                    heart muscles and to prevent any further
                    complications.
                  </p>
                  <footer class="mt-12">
                    <p>Thanks & Regards,</p>
                    <p>Dr. Alexandar MD</p>
                  </footer>
                </article>
                <ul class="flex space-x-4 mt-12">
                  <li class="w-10 h-10 border rounded-lg p-1 cursor-pointer transition duration-200 text-indigo-600 hover:bg-blue-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1"
                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                      />
                    </svg>
                  </li>
                  <li class="w-10 h-10 border rounded-lg p-1 cursor-pointer transition duration-200 text-blue-800 hover:bg-blue-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1"
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                      />
                    </svg>
                  </li>
                  <li class="w-10 h-10 border rounded-lg p-1 cursor-pointer transition duration-200 text-pink-400 hover:bg-blue-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1"
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                      />
                    </svg>
                  </li>
                  <li class="w-10 h-10 border rounded-lg p-1 cursor-pointer transition duration-200 text-yellow-500 hover:bg-blue-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1"
                        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                      />
                    </svg>
                  </li>
                </ul>
              </section>
              <section class="mt-6 border rounded-xl bg-gray-50 mb-3">
                <textarea
                  class="w-full bg-gray-50 p-2 rounded-xl"
                  placeholder="Type your reply here..."
                  rows="3"
                ></textarea>
                <div class="flex items-center justify-between p-2">
                  <button class="h-6 w-6 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </button>
                  <button class="bg-purple-600 text-white px-6 py-2 rounded-xl">
                    Reply
                  </button>
                </div>
              </section>
            </section>
          </main>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default StaffDashboard;
