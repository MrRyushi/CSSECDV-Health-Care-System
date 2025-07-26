import {
  config,
  signInAuth,
  db,
} from "../../../../firebase/Firebase";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  startAfter,
  limit,
  query,
  startAt,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  useState,
  useEffect,
  Fragment,
  useRef,
} from "react";
import pfp from "./pfp.jpg";
import searchIcon from "./search.png";

import RequiredAsterisk from "./components/asterisk";
import emailjs from "emailjs-com";
import FamilyHistory from "./components/FamilyHistory";
import PersonalMedicalHistory from "./components/PersonalMedicalHistory";
import Vaccination from "./components/Vaccination";
import Sidebar from "../../components/Sidebar";
import { Form, useNavigate } from "react-router-dom";

import { Dialog, Transition } from "@headlessui/react";

import "./patientlist.css";

function PatientList() {
  const navigate = useNavigate();
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
    bloodtype: "",
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
  const [ShowForm, setShowForm] = useState(false);
  const [ShowForm2, setShowForm2] = useState(false);
  const [ShowForm3, setShowForm3] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // navigator for edit patient form pages
  const [page1Bg, setPage1Bg] = useState("bg-blue-800");
  const [page2Bg, setPage2Bg] = useState("bg-white");
  const [page3Bg, setPage3Bg] = useState("bg-white");
  const [page4Bg, setPage4Bg] = useState("bg-white");

  // staff info
  const [selected, setSelected] = useState("patient-list");
  const [fullName, setFullName] = useState("");
  const [clinics, setClinics] = useState("");
  function changeSelected(selected) {
    setSelected(selected);
  }

  // handle edit patient navigation
  function handleEditPatientNavigaton(pageSelected) {
    switch (pageSelected) {
      case 1:
        setPage1Bg("bg-blue-800");
        setPage2Bg("bg-white");
        setPage3Bg("bg-white");
        setPage4Bg("bg-white");
        setCurrentPage(1);
        break;
      case 2:
        setPage1Bg("bg-white");
        setPage2Bg("bg-blue-800");
        setPage3Bg("bg-white");
        setPage4Bg("bg-white");
        setCurrentPage(2);
        break;
      case 3:
        setPage1Bg("bg-white");
        setPage2Bg("bg-white");
        setPage3Bg("bg-blue-800");
        setPage4Bg("bg-white");
        setCurrentPage(3);
        break;
      case 4:
        setPage1Bg("bg-white");
        setPage2Bg("bg-white");
        setPage3Bg("bg-white");
        setPage4Bg("bg-blue-800");
        setCurrentPage(4);
        break;
    }
  }

  // get full name of staff
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

  function isPasswordComplex(password) {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}[\]|:;"'<>,.?/~`]).{12,}$/;
    return regex.test(password);
  }

  async function initializeClinic(e) {
    e.preventDefault();
    const emailFormatted = email;

    if (!isPasswordComplex(password)) {
      alert(
        "Password must be at least 12 characters long and include an uppercase letter, lowercase letter, number, and special character."
      );
      return;
    }
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

  // functions for getting family history
  function getRelativeFullName(fullname, index) {
    handleInputChangeFamily(
      index,
      "relativeName",
      fullname
    );
  }

  function getRelationshipWithRelative(
    relationship,
    index
  ) {
    handleInputChangeFamily(
      index,
      "relationshipWithRelative",
      relationship
    );
  }

  function getRelativeCondition(condition, index) {
    handleInputChangeFamily(
      index,
      "relativeCondition",
      condition
    );
  }

  function getRelativeMedications(medications, index) {
    handleInputChangeFamily(
      index,
      "relativeMedications",
      medications
    );
  }

  // functions for getting vaccination
  function getVaccineType(vaccineType, index) {
    handleInputChangeVaccine(
      index,
      "vaccineType",
      vaccineType
    );
  }

  function getVaccineBrand(vaccineBrand, index) {
    handleInputChangeVaccine(
      index,
      "vaccineBrand",
      vaccineBrand
    );
  }

  function getVaccineDate(vaccineDate, index) {
    handleInputChangeVaccine(
      index,
      "vaccineDate",
      vaccineDate
    );
  }

  function getVaccineRemarks(vaccineRemarks, index) {
    handleInputChangeVaccine(
      index,
      "vaccineRemarks",
      vaccineRemarks
    );
  }

  // functions for getting Personal Medical History
  function getHistoryType(historyType, index) {
    handleInputChangePersonal(
      index,
      "historyType",
      historyType
    );
  }

  function getHistoryDate(historyDate, index) {
    handleInputChangePersonal(
      index,
      "historyDate",
      historyDate
    );
  }

  function getHistoryRemarks(historyRemarks, index) {
    handleInputChangePersonal(
      index,
      "historyRemarks",
      historyRemarks
    );
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
                  setDoc(
                    doc(
                      collection(
                        config.firestore,
                        clinicName,
                        "patients",
                        "patientlist",
                        userCredential.user.uid,
                        "baselineInformation"
                      ),
                      "baselineInformation"
                    ),
                    {
                      firstname: firstName,
                      middleName: formData.middleName,
                      lastname: formData.lastName,
                      email: formData.email,
                      phoneNumber: formData.phoneNumber,
                      streetAddress: formData.streetAddress,
                      sex: sex,
                      bloodType: bloodType,
                      emergencyContactName:
                        formData.emergencyContactName,
                      emergencyContactNumber:
                        formData.emergencyContactNumber,
                      allergies: formData.allergies,
                    }
                  );

                  // add Doc
                  familyHistoryList.forEach(
                    (item, index) => {
                      // Modify keys in the same dictionary
                      for (const key in item) {
                        item[`${key}${index}`] = item[key];
                        delete item[key];
                      }
                    }
                  );
                  familyHistoryList.forEach(
                    (item, index) => {
                      updateDoc(
                        doc(
                          collection(
                            config.firestore,
                            clinicName,
                            "patients",
                            "patientlist",
                            userCredential.user.uid,
                            "baselineInformation"
                          ),
                          "baselineInformation"
                        ),
                        item
                      );
                    }
                  );
                  vaccinationList.forEach((item, index) => {
                    // Modify keys in the same dictionary
                    for (const key in item) {
                      item[`${key}${index}`] = item[key];
                      delete item[key];
                    }
                  });
                  vaccinationList.forEach((item, index) => {
                    updateDoc(
                      doc(
                        collection(
                          config.firestore,
                          clinicName,
                          "patients",
                          "patientlist",
                          userCredential.user.uid,
                          "baselineInformation"
                        ),
                        "baselineInformation"
                      ),
                      item
                    );
                  });
                  personalList.forEach((item, index) => {
                    // Modify keys in the same dictionary
                    for (const key in item) {
                      item[`${key}${index}`] = item[key];
                      delete item[key];
                    }
                  });
                  personalList.forEach((item, index) => {
                    updateDoc(
                      doc(
                        collection(
                          config.firestore,
                          clinicName,
                          "patients",
                          "patientlist",
                          userCredential.user.uid,
                          "baselineInformation"
                        ),
                        "baselineInformation"
                      ),
                      item
                    );
                  });

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
                  setShowForm(false);
                  clearFormValues();
                  setCurrentPage(1);
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
                  alert(
                    "Registration failed. Please check your information and try again."
                  );
                });
            } else {
              console.log("Document does not exist");
            }
          })
          .catch((error) => {
            console.error("Error getting document:", error);
          });
      } catch (error) {
        console.error("Error initializing clinic:", error);
      }
    }
  }, [formData]);

  const [clinicName, setClinicName] = useState("");
  const [loading, setLoading] = useState(true); // Initial loading state

  getDoc(
    doc(
      config.firestore,
      "clinicStaffs",
      config.auth.currentUser.uid
    )
  )
    .then((docSnapshot) => {
      if (docSnapshot.exists()) {
        const clinicName = docSnapshot.data().clinicName;
        setClinicName(clinicName);
      } else {
        console.error(
          "No document found for the current user"
        );
      }
    })
    .catch((error) => {
      console.error("Error getting document:", error);
    });

  const [patientList, setPatientList] = useState([]);

  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
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
            patientsCollectionRef,
            limit(5)
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
          setFirstVisible(querySnapshot.docs[0]);
          setLastVisible(
            querySnapshot.docs[
              querySnapshot.docs.length - 1
            ]
          );
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

  //  SEARCH PATIENT
  const [searchedPatients, setSearchedPatients] = useState(
    []
  );

  async function searchPatient(e) {
    if (clinicName) {
      try {
        e.preventDefault();

        const nameQuery = document
          .getElementById("search-first-name")
          .value.trim()
          .toLowerCase();
        const numberQuery = document
          .getElementById("number")
          .value.trim();
        const tempRecords = [];

        const patientsCollectionRef = collection(
          config.firestore,
          clinicName,
          "patients",
          "patientlist"
        );
        const patientsQueried = await getDocs(
          patientsCollectionRef
        );

        if (!nameQuery && !numberQuery) {
          alert(
            "Please Input a Patient Name or Contact Number"
          );
        } else {
          const baselinePromises = patientsQueried.docs.map(
            async (patientDoc) => {
              const baselineInformationCollectionRef =
                collection(
                  config.firestore,
                  clinicName,
                  "patients",
                  "patientlist",
                  patientDoc.id,
                  "baselineInformation"
                );
              const baselineInformationQuery = query(
                baselineInformationCollectionRef
              );
              const baselineInformationSnapshot =
                await getDocs(baselineInformationQuery);

              let patientFound = false;

              baselineInformationSnapshot.docs.forEach(
                (baselineDoc) => {
                  const data = baselineDoc.data();
                  const fullName =
                    `${data.firstname} ${data.lastname}`
                      .trim()
                      .toLowerCase();

                  const nameParts = nameQuery.split(/\s+/);
                  const firstNameMatch = nameParts.some(
                    (part) =>
                      data.firstname &&
                      data.firstname.includes(part)
                  );
                  const lastNameMatch = nameParts.some(
                    (part) =>
                      data.lastname &&
                      data.lastname.includes(part)
                  );

                  if (
                    ((nameQuery &&
                      (firstNameMatch ||
                        lastNameMatch ||
                        fullName.includes(nameQuery))) ||
                      !nameQuery) &&
                    ((numberQuery &&
                      data.phoneNumber &&
                      data.phoneNumber === numberQuery) ||
                      !numberQuery)
                  ) {
                    data.uid = patientDoc.id;
                    tempRecords.push(data);
                    patientFound = true;
                  }
                }
              );

              return patientFound;
            }
          );

          const results = await Promise.all(
            baselinePromises
          );

          if (!results.includes(true)) {
            alert("No Patient Found");
          }

          setSearchedPatients(tempRecords);
        }
      } catch (error) {
        console.error(
          "Error getting documents from patientlist collection:",
          error
        );
      }
    }
  }

  // PAGINATION

  async function nextPatients() {
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
          patientsCollectionRef,
          limit(5),
          startAfter(lastVisible)
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
          const baselineInformationSnapshot = await getDocs(
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
        setLastVisible(
          querySnapshot.docs[querySnapshot.docs.length - 1]
        );
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

  async function previousPatients() {
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
          patientsCollectionRef,
          limit(5),
          startAt(firstVisible)
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
          const baselineInformationSnapshot = await getDocs(
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
        setFirstVisible(querySnapshot.docs[0]);
        setLastVisible(
          querySnapshot.docs[querySnapshot.docs.length - 1]
        );
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

  // Modal
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const cancelButtonRef = useRef(null);

  // Presentation
  const [showEmptyDiv, setShowEmptyDiv] = useState(false);

  const toggleEmptyDiv = () => {
    setShowEmptyDiv(!showEmptyDiv);
  };

  // Multiple Instances [Family History]
  const [familyHistoryList, setFamilyHistoryList] =
    useState([{}]);

  const handleAddClickFamily = () => {
    setFamilyHistoryList([...familyHistoryList, {}]);
  };

  const handleRemoveClickFamily = () => {
    if (familyHistoryList.length > 1) {
      setFamilyHistoryList((prevList) => [
        ...prevList.slice(0, -1),
      ]);
    }
  };

  const handleInputChangeFamily = (index, field, value) => {
    setFamilyHistoryList((prevList) => {
      const updatedList = [...prevList];
      updatedList[index][field] = value;
      return updatedList;
    });
  };

  // Multiple Instances [Vaccination]
  const [vaccinationList, setVaccinationList] = useState([
    {},
  ]);

  const handleAddClickVaccine = () => {
    setVaccinationList([...vaccinationList, {}]);
  };

  const handleRemoveClickVaccine = () => {
    console.log("HELLO WORLD");
    if (vaccinationList.length > 1) {
      setVaccinationList((prevList) => [
        ...prevList.slice(0, -1),
      ]);
    }
  };

  const handleInputChangeVaccine = (
    index,
    field,
    value
  ) => {
    setVaccinationList((prevList) => {
      const updatedList = [...prevList];
      updatedList[index][field] = value;
      return updatedList;
    });
  };

  // Multiple Instances [Personal Medical History]
  const [personalList, setPersonalList] = useState([{}]);

  const handleAddClickPersonal = () => {
    setPersonalList([...personalList, {}]);
  };

  const handleRemoveClickPersonal = () => {
    if (personalList.length > 1) {
      setPersonalList((prevList) => [
        ...prevList.slice(0, -1),
      ]);
    }
  };

  const handleInputChangePersonal = (
    index,
    field,
    value
  ) => {
    setPersonalList((prevList) => {
      const updatedList = [...prevList];
      updatedList[index][field] = value;
      return updatedList;
    });
  };

  // Update Patient Information
  const [currentUID, setCurrentUID] = useState(null);
  const updatePatientInformation = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateDoc(
      doc(config.firestore, "clinicPatient", currentUID),
      {
        firstName: firstName,
        lastName: lastName,
      }
    );
    setDoc(
      doc(
        collection(
          config.firestore,
          clinicName,
          "patients",
          "patientlist",
          currentUID,
          "baselineInformation"
        ),
        "baselineInformation"
      ),
      {
        firstname: firstName,
        middleName: middleName,
        lastname: lastName,
        email: email,
        streetAddress: streetAddress,
        sex: sex,
        bloodType: bloodType,
        phoneNumber: phoneNumber,
        emergencyContactName: emergencyContactName,
        emergencyContactNumber: emergencyContactNumber,
        allergies: allergies,
      }
    );

    familyHistoryList.forEach((item, index) => {
      // Modify keys in the same dictionary
      for (const key in item) {
        item[`${key}${index}`] = item[key];
        delete item[key];
      }
    });
    familyHistoryList.forEach((item, index) => {
      updateDoc(
        doc(
          collection(
            config.firestore,
            clinicName,
            "patients",
            "patientlist",
            currentUID,
            "baselineInformation"
          ),
          "baselineInformation"
        ),
        item
      );
    });
    vaccinationList.forEach((item, index) => {
      // Modify keys in the same dictionary
      for (const key in item) {
        item[`${key}${index}`] = item[key];
        delete item[key];
      }
    });
    vaccinationList.forEach((item, index) => {
      updateDoc(
        doc(
          collection(
            config.firestore,
            clinicName,
            "patients",
            "patientlist",
            currentUID,
            "baselineInformation"
          ),
          "baselineInformation"
        ),
        item
      );
    });
    personalList.forEach((item, index) => {
      // Modify keys in the same dictionary
      for (const key in item) {
        item[`${key}${index}`] = item[key];
        delete item[key];
      }
    });
    personalList.forEach((item, index) => {
      updateDoc(
        doc(
          collection(
            config.firestore,
            clinicName,
            "patients",
            "patientlist",
            currentUID,
            "baselineInformation"
          ),
          "baselineInformation"
        ),
        item
      );
    });
    clearFormValues();
    setShowForm2(false);
  };

  // Load key data
  const [patientInfo, setCurrentData] = useState(null);
  const handleClick = async (key) => {
    const baselineInformationCollectionRef = doc(
      config.firestore,
      clinicName,
      "patients",
      "patientlist",
      key,
      "baselineInformation",
      "baselineInformation"
    );
    const baselineInformationSnapshot = await getDoc(
      baselineInformationCollectionRef
    );
    setCurrentData(baselineInformationSnapshot.data());
    setCurrentUID(key);

    // UPDATE FORM FIELDS
    setFirstName(
      baselineInformationSnapshot.data().firstname
    );
    setMiddleName(
      baselineInformationSnapshot.data().middleName
    );
    setLastName(
      baselineInformationSnapshot.data().lastname
    );
    setSex(baselineInformationSnapshot.data().sex);
    setBloodType(
      baselineInformationSnapshot.data().bloodType
    );
    setPhoneNumber(
      baselineInformationSnapshot.data().phoneNumber
    );
    setStreetAddress(
      baselineInformationSnapshot.data().streetAddress
    );
    setEmail(baselineInformationSnapshot.data().email);
    setEmergencyContactName(
      baselineInformationSnapshot.data()
        .emergencyContactName
    );
    setEmergencyContactNumber(
      baselineInformationSnapshot.data()
        .emergencyContactNumber
    );
    setAllergies(
      baselineInformationSnapshot.data().allergies
    );

    // SET FAMILY HISTORY INSTANCES
    var filteredData = Object.entries(
      baselineInformationSnapshot.data()
    ).reduce((acc, [key, value]) => {
      if (key.startsWith("rel")) {
        acc[key] = value;
      }
      return acc;
    }, {});

    var groupedDict = {};

    for (const [key, value] of Object.entries(
      filteredData
    )) {
      // Extract the number at the end of the key using regular expression
      const match = key.match(/\d+$/);

      if (match) {
        const number = match[0];
        const keyWithoutNumber = key.replace(/\d+$/, ""); // Remove the numerical value at the end of the key

        // Create a new dictionary for each number if it doesn't exist
        if (!groupedDict[number]) {
          groupedDict[number] = {};
        }

        // Add key-value pair to the corresponding number's dictionary
        groupedDict[number][keyWithoutNumber] = value;
      }
    }
    setFamilyHistoryList(Object.values(groupedDict));

    // SET VACCINATION HISTORY INSTANCES
    filteredData = Object.entries(
      baselineInformationSnapshot.data()
    ).reduce((acc, [key, value]) => {
      if (key.startsWith("vac")) {
        acc[key] = value;
      }
      return acc;
    }, {});

    groupedDict = {};

    for (const [key, value] of Object.entries(
      filteredData
    )) {
      // Extract the number at the end of the key using regular expression
      const match = key.match(/\d+$/);

      if (match) {
        const number = match[0];
        const keyWithoutNumber = key.replace(/\d+$/, ""); // Remove the numerical value at the end of the key

        // Create a new dictionary for each number if it doesn't exist
        if (!groupedDict[number]) {
          groupedDict[number] = {};
        }

        // Add key-value pair to the corresponding number's dictionary
        groupedDict[number][keyWithoutNumber] = value;
      }
    }

    setVaccinationList(Object.values(groupedDict));

    // SET PERSONAL HISTORY INSTANCES
    filteredData = Object.entries(
      baselineInformationSnapshot.data()
    ).reduce((acc, [key, value]) => {
      if (key.startsWith("his")) {
        acc[key] = value;
      }
      return acc;
    }, {});

    groupedDict = {};

    for (const [key, value] of Object.entries(
      filteredData
    )) {
      // Extract the number at the end of the key using regular expression
      const match = key.match(/\d+$/);

      if (match) {
        const number = match[0];
        const keyWithoutNumber = key.replace(/\d+$/, ""); // Remove the numerical value at the end of the key

        // Create a new dictionary for each number if it doesn't exist
        if (!groupedDict[number]) {
          groupedDict[number] = {};
        }

        // Add key-value pair to the corresponding number's dictionary
        groupedDict[number][keyWithoutNumber] = value;
      }
    }

    setPersonalList(Object.values(groupedDict));

    setShowForm2(true);
    console.log(`Clicked on element with key: ${key}`);
  };

  // Clear Key Data
  const clearFormValues = () => {
    // Clear baseline information
    setCurrentData(null); // Assuming setCurrentData is used to set baseline information

    // Clear form fields
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setSex("");
    setBloodType("");
    setPhoneNumber("");
    setStreetAddress("");
    setEmail("");
    setEmergencyContactName("");
    setEmergencyContactNumber("");
    setAllergies("");

    // Clear family history instances
    setFamilyHistoryList([{}]);

    // Clear vaccination history instances
    setVaccinationList([{}]);

    // Clear personal history instances
    setPersonalList([{}]);

    // Hide the form
    setShowForm2(false);
  };

  const tabStyles = (tabNumber) => {
    const baseStyles =
      "inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group";
    const activeStyles = "text-blue-600 border-blue-600";
    const inactiveStyles =
      "text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-300";

    return tabNumber === currentPage
      ? `${baseStyles} ${activeStyles} active dark:${activeStyles}`
      : `${baseStyles} ${inactiveStyles}`;
  };
  return (
    <>
      {/* Modal */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              {showEmptyDiv ? (
                <div>
                  <div
                    className="bg-gray-50 rounded-xl"
                    style={{
                      width: "50vw",
                      height: "80vh",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#485af4",
                        width: "100%",
                        height: "13%",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", // Center vertically
                        justifyContent: "center", // Center horizontally
                      }}
                    >
                      <p
                        className="text-4xl font-normal text-white"
                        style={{}}
                      >
                        PATIENT INFORMATION FORM
                      </p>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "67%",
                        backgroundColor: "white",
                      }}
                    >
                      <div>
                        <p className="text-sm text-gray-500">
                          {/* Patient Information */}
                          Allergies: {patientInfo.allergies}
                          <br />
                          Blood Type:{" "}
                          {patientInfo.bloodType}
                          <br />
                          Email: {patientInfo.email}
                          <br />
                          Emergency Contact Name:{" "}
                          {patientInfo.emergencyContactName}
                          <br />
                          Emergency Contact Number:{" "}
                          {
                            patientInfo.emergencyContactNumber
                          }
                          <br />
                          First Name:{" "}
                          {patientInfo.firstname}
                          <br />
                          Last Name: {patientInfo.lastname}
                          <br />
                          Phone Number:{" "}
                          {patientInfo.phoneNumber}
                          <br />
                          Sex: {patientInfo.sex}
                          <br />
                          Street Address:{" "}
                          {patientInfo.streetAddress}
                        </p>
                      </div>
                    </div>
                    {/* <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto transition ease-in-out delay-150 bg-blue-500 hover:-translate-y-1 hover:scale-110 hover:bg-lime-800 duration-300"
                                onClick={() => setOpen(false)}
                                ref={cancelButtonRef}
                            >
                                Return
                            </button> */}
                  </div>
                </div>
              ) : (
                <div
                  className="bg-gray-50 rounded-xl"
                  style={{ width: "50vw", height: "80vh" }}
                >
                  <div
                    style={{
                      backgroundColor: "#485af4",
                      width: "100%",
                      height: "25%",
                      borderBottomLeftRadius: "10vh",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center", // Center vertically
                      justifyContent: "center", // Center horizontally
                    }}
                  >
                    <img
                      src={pfp}
                      alt=""
                      style={{
                        width: "18%",
                        borderRadius: "50%", // Makes the image circular
                        border: "5px solid #A3ACFC", // Adds a 3px border with the specified color
                      }}
                    />
                    <div
                      className="flex flex-col"
                      style={{
                        textAlign: "left",
                        marginLeft: "1.2vw",
                        marginRight: "3vw",
                      }}
                    >
                      <p
                        className="text-4xl font-normal text-white"
                        style={{}}
                      >
                        Patient Name
                      </p>
                      <p
                        className="text-xl font-thin text-white"
                        style={{
                          marginTop: "1vh",
                          marginBottom: "2vh",
                        }}
                      >
                        Sex | Age yrs old
                      </p>
                    </div>

                    <button
                      className="border-2 border-white text-2xl text-white px-5 py-3 rounded-lg hover:bg-white hover:text-[#485af4] hover:border-[#485af4] transition-all"
                      style={{
                        marginLeft: "2vw",
                        marginBottom: "2vh",
                      }}
                    >
                      Edit Records
                    </button>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "67%",
                      backgroundColor: "white",
                    }}
                  >
                    <div className="w-full h-2/3 bg-white flex flex-col items-center justify-center">
                      <div className="w-full h-2/3 bg-white flex flex-col items-center justify-center">
                        <button
                          className="border-b-4 p-2 m-2 border-gray-300 button-choice-menu text-3xl font-normal"
                          style={{
                            width: "80%",
                            marginTop: "15vh",
                          }}
                          onClick={toggleEmptyDiv}
                        >
                          <span className="text-3xl font-normal">
                            Personal Information
                          </span>
                        </button>
                        <button
                          className="border-b-4 p-2 m-2 border-gray-300 button-choice-menu"
                          style={{
                            width: "80%",
                            marginTop: "3vh",
                          }}
                        >
                          <span className="text-3xl font-normal">
                            Patient Medical History
                          </span>
                        </button>
                        <button
                          className="border-b-4 p-2 m-2 border-gray-300 button-choice-menu"
                          style={{
                            width: "80%",
                            marginTop: "3vh",
                          }}
                        >
                          <span className="text-3xl font-normal">
                            Vaccination Records
                          </span>
                        </button>
                        <button
                          className="border-b-4 p-2 m-2 border-gray-300 button-choice-menu"
                          style={{
                            width: "80%",
                            marginTop: "3vh",
                          }}
                        >
                          <span className="text-3xl font-normal">
                            Family Medical History
                          </span>
                        </button>
                        <button
                          className="border-b-4 p-2 m-2 border-gray-300 button-choice-menu"
                          style={{
                            width: "80%",
                            marginTop: "3vh",
                          }}
                        >
                          <span className="text-3xl font-normal">
                            Clinic Visit List
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <hr
                    style={{
                      border: "none",
                      borderTop: "3px solid #d1d5db",
                    }}
                  />
                  <div
                    style={{
                      width: "100%",
                      height: "8%",
                      alignItems: "center",
                      display: "flex",
                    }}
                  >
                    <button
                      style={{
                        border: "2px solid #909090",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        backgroundColor: "transparent",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "#444242",
                        fontSize: "24px",
                        textAlign: "center",
                        marginLeft: "10px",
                      }}
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      <div>←</div>
                    </button>
                    <p
                      style={{
                        marginLeft: "0.3vw",
                        color: "#444242",
                      }}
                    >
                      Back to Patients Database
                    </p>
                  </div>
                  {/* <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto transition ease-in-out delay-150 bg-blue-500 hover:-translate-y-1 hover:scale-110 hover:bg-lime-800 duration-300"
                                onClick={() => setOpen(false)}
                                ref={cancelButtonRef}
                            >
                                Return
                            </button> */}
                </div>
              )}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="h-screen w-full flex overflow-hidden">
        <Sidebar
          selected={selected}
          name={fullName}
          changeSelected={changeSelected}
        />

        {selected == "patient-list" ? (
          <div className="staff-list flex-grow p-4">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div class="mx-auto  px-4 py-8 sm:px-8">
                <div class="flex items-center justify-between pb-6">
                  <div></div>
                  <div class="flex items-center justify-between space-x-4">
                    <button
                      onClick={() =>
                        setShowForm3(
                          (prevShowForm3) => !prevShowForm3
                        )
                      }
                      class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xl font-semibold text-white focus:outline-none focus:ring hover:bg-blue-700"
                    >
                      SEARCH PATIENT
                    </button>
                    <button
                      onClick={() =>
                        setShowForm(
                          (prevShowForm) => !prevShowForm
                        )
                      }
                      class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xl font-semibold text-white focus:outline-none focus:ring hover:bg-blue-700"
                    >
                      CREATE NEW PATIENT
                    </button>
                  </div>
                </div>
                <div class="overflow-y-hidden rounded-lg border">
                  <div class="overflow-x-auto">
                    <table class="w-full">
                      <thead>
                        <tr class="bg-blue-600 text-left text-xs font-semibold uppercase tracking-widest text-white">
                          <th class="px-5 py-3"> </th>
                          <th class="px-5 py-3">Sex</th>
                          <th class="px-5 py-3">
                            Full Name
                          </th>
                          <th class="px-5 py-3">
                            Contact No.
                          </th>
                          <th class="px-5 py-3">Email</th>
                          <th class="px-5 py-3">Records</th>
                        </tr>
                      </thead>
                      <tbody class="text-gray-500">
                        {patientList.map(
                          (patient, index) => (
                            <tr>
                              <td class="border-b border-r border-gray-200 bg-white px-5 py-5 text-sm">
                                <p class="whitespace-no-wrap">
                                  {index + 1}
                                </p>
                              </td>
                              <td class="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                                <span
                                  className={`rounded-full px-3 py-1 text-s font-semibold ${
                                    patient.sex === "Male"
                                      ? "bg-blue-200 text-blue-900"
                                      : "bg-pink-200 text-pink-900"
                                  }`}
                                >
                                  {patient.sex === "Male"
                                    ? "Male"
                                    : "Female"}
                                </span>
                              </td>
                              <td class="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                                <div class="flex items-center">
                                  <div class="h-10 w-10 flex-shrink-0">
                                    <img
                                      class="h-full w-full rounded-full"
                                      src={pfp}
                                      alt=""
                                    />
                                  </div>
                                  <div class="ml-3">
                                    <p class="whitespace-no-wrap">
                                      {patient.firstname}{" "}
                                      {patient.lastname}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td class="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                                <p class="whitespace-no-wrap">
                                  {patient.phoneNumber}
                                </p>
                              </td>
                              <td class="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                                <p class="whitespace-no-wrap">
                                  {patient.email}
                                </p>
                              </td>

                              <td class="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                                <button
                                  key={patient.uid}
                                  onClick={() =>
                                    handleClick(patient.uid)
                                  }
                                  class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-md font-semibold text-white focus:outline-none focus:ring hover:bg-blue-700"
                                >
                                  VIEW
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div class="flex flex-col items-center border-t bg-white px-5 py-5 sm:flex-row sm:justify-between">
                    <span class="text-xs text-gray-600 sm:text-sm">
                      {" "}
                      Showing 1 to 5 of 12 Entries{" "}
                    </span>
                    <div class="mt-2 inline-flex sm:mt-0">
                      <button
                        class="mr-2 h-12 w-12 rounded-full border text-sm font-semibold text-gray-600 transition duration-150 hover:bg-gray-100"
                        onClick={previousPatients}
                      >
                        Prev
                      </button>
                      <button
                        class="h-12 w-12 rounded-full border text-sm font-semibold text-gray-600 transition duration-150 hover:bg-gray-100"
                        onClick={nextPatients}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <> </>
        )}

        {selected == "dashboard" ? (
          navigate("../clinic-staff")
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
      {ShowForm && (
        <div className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-2xl max-h-full mx-auto lato">
            <div className="flex items-start justify-between p-4 border-b rounded-t bg-blue-800">
              <h3 className="p-2 text-xl font-semibold text-white-900 dark:text-white">
                PATIENT INFORMATION FORM
              </h3>
              <button
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-slate-50 dark:hover:text-black"
                onClick={() => {
                  setShowForm(false);
                  clearFormValues();
                  setCurrentPage(1);
                }}
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
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="relative bg-white shadow shadow-2xl drop-shadow-2xl border border-black">
              <div className="p-10 space-y-6 text-black">
                <form
                  className="mx-auto exo"
                  onSubmit={initializeClinic}
                >
                  <div className="space-y-12 text-black">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                        <li className="me-2">
                          <a
                            onClick={() =>
                              setCurrentPage(1)
                            }
                            className={tabStyles(1)}
                          >
                            <svg
                              className="w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 18 20"
                            >
                              <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                            </svg>
                            Personal Info
                          </a>
                        </li>
                        <li className="me-2">
                          <a
                            onClick={() =>
                              setCurrentPage(2)
                            }
                            className={tabStyles(2)}
                          >
                            <svg
                              className="w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 18 20"
                            >
                              <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                            </svg>
                            Family Hist
                          </a>
                        </li>
                        <li className="me-2">
                          <a
                            onClick={() =>
                              setCurrentPage(3)
                            }
                            className={tabStyles(3)}
                          >
                            <svg
                              className="w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 18 20"
                            >
                              <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                            </svg>
                            Vaccination
                          </a>
                        </li>
                        <li className="me-2">
                          <a
                            onClick={() =>
                              setCurrentPage(4)
                            }
                            className={tabStyles(4)}
                          >
                            <svg
                              className="w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 18 20"
                            >
                              <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                            </svg>
                            Personal Hist
                          </a>
                        </li>
                      </ul>
                    </div>
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
                              Last name <RequiredAsterisk />
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
                                  setSex(e.target.value)
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
                                <option value="A+" selected>
                                  A+
                                </option>
                                <option value="B+">
                                  B+
                                </option>
                                <option value="AB+">
                                  AB+
                                </option>
                                <option value="O+">
                                  O+
                                </option>
                                <option value="A-">
                                  A-
                                </option>
                                <option value="B-">
                                  B-
                                </option>
                                <option value="AB-">
                                  AB-
                                </option>
                                <option value="O-">
                                  O-
                                </option>
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
                                  setEmail(e.target.value)
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
                              Password <RequiredAsterisk />
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
                                value={emergencyContactName}
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
                              Emergency Contact Phone Number{" "}
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
                      </div>
                    ) : (
                      <></>
                    )}

                    {currentPage == 2 ? (
                      <div>
                        <br />
                        <div style={{ float: "right" }}>
                          <button
                            className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            type="button"
                            onClick={
                              handleRemoveClickFamily
                            }
                            disabled={
                              personalList.length === 1
                            }
                          >
                            Remove
                          </button>
                          <button
                            className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            type="button"
                            style={{ marginLeft: "1vw" }}
                            onClick={handleAddClickFamily}
                          >
                            Add Form
                          </button>
                        </div>
                        {familyHistoryList.map(
                          (familyHistory, index) => (
                            <FamilyHistory
                              key={index}
                              relativeFullName={
                                familyHistory.relativeName
                              }
                              relationshipWithRelative={
                                familyHistory.relationshipWithRelative
                              }
                              relativeCondition={
                                familyHistory.relativeCondition
                              }
                              relativeMedications={
                                familyHistory.relativeMedications
                              }
                              getRelativeFullName={(
                                fullname
                              ) =>
                                getRelativeFullName(
                                  fullname,
                                  index
                                )
                              }
                              getRelationshipWithRelative={(
                                relationship
                              ) =>
                                getRelationshipWithRelative(
                                  relationship,
                                  index
                                )
                              }
                              getRelativeCondition={(
                                condition
                              ) =>
                                getRelativeCondition(
                                  condition,
                                  index
                                )
                              }
                              getRelativeMedications={(
                                medications
                              ) =>
                                getRelativeMedications(
                                  medications,
                                  index
                                )
                              }
                              style={{ marginTop: "1vh" }}
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <></>
                    )}

                    {currentPage == 3 ? (
                      <div>
                        <br />
                        <div style={{ float: "right" }}>
                          <button
                            className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            type="button"
                            onClick={
                              handleRemoveClickVaccine
                            }
                            disabled={
                              personalList.length === 1
                            }
                          >
                            Remove
                          </button>
                          <button
                            className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            type="button"
                            style={{ marginLeft: "1vw" }}
                            onClick={handleAddClickVaccine}
                          >
                            Add Form
                          </button>
                        </div>
                        {vaccinationList.map(
                          (vaccinationHistory, index) => (
                            <Vaccination
                              key={index}
                              vaccineType={
                                vaccinationHistory.vaccineType
                              }
                              vaccineBrand={
                                vaccinationHistory.vaccineBrand
                              }
                              vaccineDate={
                                vaccinationHistory.vaccineDate
                              }
                              vaccineRemarks={
                                vaccinationHistory.vaccineRemarks
                              }
                              getVaccineType={(
                                vaccineType
                              ) =>
                                getVaccineType(
                                  vaccineType,
                                  index
                                )
                              }
                              getVaccineBrand={(
                                vaccineBrand
                              ) =>
                                getVaccineBrand(
                                  vaccineBrand,
                                  index
                                )
                              }
                              getVaccineDate={(
                                vaccineDate
                              ) =>
                                getVaccineDate(
                                  vaccineDate,
                                  index
                                )
                              }
                              getVaccineRemarks={(
                                vaccineRemarks
                              ) =>
                                getVaccineRemarks(
                                  vaccineRemarks,
                                  index
                                )
                              }
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <></>
                    )}

                    {currentPage == 4 ? (
                      <div>
                        <br />
                        <div style={{ float: "right" }}>
                          <button
                            className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            type="button"
                            onClick={
                              handleRemoveClickPersonal
                            }
                            disabled={
                              personalList.length === 1
                            }
                          >
                            Remove
                          </button>
                          <button
                            className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            type="button"
                            style={{ marginLeft: "1vw" }}
                            onClick={handleAddClickPersonal}
                          >
                            Add Form
                          </button>
                        </div>
                        {personalList.map(
                          (personalHistory, index) => (
                            <PersonalMedicalHistory
                              key={index}
                              historyType={
                                personalHistory.historyType
                              }
                              historyDate={
                                personalHistory.historyDate
                              }
                              historyRemarks={
                                personalHistory.historyRemarks
                              }
                              getHistoryType={(
                                historyType
                              ) =>
                                getHistoryType(
                                  historyType,
                                  index
                                )
                              }
                              getHistoryDate={(
                                historyDate
                              ) =>
                                getHistoryDate(
                                  historyDate,
                                  index
                                )
                              }
                              getHistoryRemarks={(
                                historyRemarks
                              ) =>
                                getHistoryRemarks(
                                  historyRemarks,
                                  index
                                )
                              }
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <></>
                    )}

                    <div className="flex justify-between">
                      <div></div>
                      <div className="inline">
                        <button
                          className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          type="submit"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {ShowForm3 && (
        <div className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-4xl max-h-full mx-auto lato">
            <div className="flex items-start justify-between p-4 border-b rounded-t bg-blue-800">
              <h3 className="p-2 text-xl font-semibold text-white-900 dark:text-white">
                SEARCH PATIENT INFORMATION | VIEW & EDIT
              </h3>
              <button
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-slate-50 dark:hover:text-black"
                onClick={() => {
                  setShowForm3(false);
                }}
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
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="relative bg-white shadow shadow-2xl drop-shadow-2xl border border-black">
              <div className="p-10 space-y-6 text-black">
                <form
                  className="mx-auto exo"
                  onSubmit={searchPatient}
                >
                  <div className="space-y-12 text-black">
                    <div className="mt-2">
                      <label
                        htmlFor="search-first-name"
                        className="block text-sm font-medium leading-6 text-black"
                      >
                        Patient Name
                      </label>
                      <input
                        type="text"
                        name="search-first-name"
                        id="search-first-name"
                        className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                      />
                    </div>
                    <div className="mt-2">
                      <label
                        htmlFor="number"
                        className="block text-sm font-medium leading-6 text-black"
                      >
                        Patient Contact Number
                      </label>
                      <input
                        type="number"
                        name="number"
                        id="number"
                        className="text-black block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                      />
                    </div>

                    <button
                      className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      type="buttom"
                      style={{
                        float: "right",
                        marginBottom: "20px",
                      }}
                    >
                      {" "}
                      Search
                    </button>
                  </div>
                </form>
                <table class="w-full">
                  <thead>
                    <tr class="bg-blue-600 text-left text-xs font-semibold uppercase tracking-widest text-white">
                      <th class="px-5 py-3"> </th>
                      <th class="px-5 py-3">Sex</th>
                      <th class="px-5 py-3">Full Name</th>
                      <th class="px-5 py-3">Contact No.</th>
                      <th class="px-5 py-3">Email</th>
                      <th class="px-5 py-3">Records</th>
                    </tr>
                  </thead>
                  <tbody class="text-gray-500">
                    {searchedPatients.map(
                      (patient, index) => (
                        <tr>
                          <td class="border-b border-r border-gray-200 bg-white px-5 py-5 text-sm">
                            <p class="whitespace-no-wrap">
                              {index + 1}
                            </p>
                          </td>
                          <td class="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                            <span
                              className={`rounded-full px-3 py-1 text-s font-semibold ${
                                patient.sex === "Male"
                                  ? "bg-blue-200 text-blue-900"
                                  : "bg-pink-200 text-pink-900"
                              }`}
                            >
                              {patient.sex === "Male"
                                ? "Male"
                                : "Female"}
                            </span>
                          </td>
                          <td class="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                            <div class="flex items-center">
                              <div class="h-10 w-10 flex-shrink-0">
                                <img
                                  class="h-full w-full rounded-full"
                                  src={pfp}
                                  alt=""
                                />
                              </div>
                              <div class="ml-3">
                                <p class="whitespace-no-wrap">
                                  {patient.firstname}{" "}
                                  {patient.lastname}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td class="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                            <p class="whitespace-no-wrap">
                              {patient.phoneNumber}
                            </p>
                          </td>
                          <td class="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                            <p class="whitespace-no-wrap">
                              {patient.email}
                            </p>
                          </td>

                          <td class="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                            <button
                              key={patient.uid}
                              onClick={() =>
                                handleClick(patient.uid)
                              }
                              class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-md font-semibold text-white focus:outline-none focus:ring hover:bg-blue-700"
                            >
                              VIEW
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {ShowForm2 && (
        <div className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-2xl max-h-full mx-auto lato">
            <div className="flex items-start justify-between p-4 border-b rounded-t bg-blue-800">
              <h3 className="p-2 text-xl font-semibold text-white-900 dark:text-white">
                EDIT PATIENT INFORMATION FORM
              </h3>
              <button
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-slate-50 dark:hover:text-black"
                onClick={() => {
                  setShowForm2(false);
                  clearFormValues();
                  setCurrentPage(1);
                }}
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
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="relative bg-white shadow shadow-2xl drop-shadow-2xl border border-black">
              <div className="p-10 space-y-6 text-black">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                    <li className="me-2">
                      <a
                        onClick={() => setCurrentPage(1)}
                        className={tabStyles(1)}
                      >
                        <svg
                          className="w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 18 20"
                        >
                          <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                        </svg>
                        Personal Info
                      </a>
                    </li>
                    <li className="me-2">
                      <a
                        onClick={() => setCurrentPage(2)}
                        className={tabStyles(2)}
                      >
                        <svg
                          className="w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 18 20"
                        >
                          <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                        </svg>
                        Family Hist
                      </a>
                    </li>
                    <li className="me-2">
                      <a
                        onClick={() => setCurrentPage(3)}
                        className={tabStyles(3)}
                      >
                        <svg
                          className="w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 18 20"
                        >
                          <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                        </svg>
                        Vaccination
                      </a>
                    </li>
                    <li className="me-2">
                      <a
                        onClick={() => setCurrentPage(4)}
                        className={tabStyles(4)}
                      >
                        <svg
                          className="w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 18 20"
                        >
                          <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                        </svg>
                        Personal Hist
                      </a>
                    </li>
                  </ul>
                </div>
                <form className="mx-auto exo">
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
                              Last name <RequiredAsterisk />
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
                                readOnly={true}
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
                                <option selected>A+</option>
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
                                readOnly={true}
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
                                value={emergencyContactName}
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
                              Emergency Contact Phone Number{" "}
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
                      </div>
                    ) : (
                      <></>
                    )}

                    {currentPage == 2 ? (
                      <div>
                        <div style={{ float: "right" }}>
                          <button
                            className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            type="button"
                            onClick={
                              handleRemoveClickFamily
                            }
                          >
                            Remove
                          </button>
                          <button
                            className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            type="button"
                            style={{ marginLeft: "1vw" }}
                            onClick={handleAddClickFamily}
                          >
                            Add Form
                          </button>
                        </div>
                        {familyHistoryList.map(
                          (familyHistory, index) => (
                            <FamilyHistory
                              key={index}
                              relativeFullName={
                                familyHistory.relativeName
                              }
                              relationshipWithRelative={
                                familyHistory.relationshipWithRelative
                              }
                              relativeCondition={
                                familyHistory.relativeCondition
                              }
                              relativeMedications={
                                familyHistory.relativeMedications
                              }
                              getRelativeFullName={(
                                fullname
                              ) =>
                                getRelativeFullName(
                                  fullname,
                                  index
                                )
                              }
                              getRelationshipWithRelative={(
                                relationship
                              ) =>
                                getRelationshipWithRelative(
                                  relationship,
                                  index
                                )
                              }
                              getRelativeCondition={(
                                condition
                              ) =>
                                getRelativeCondition(
                                  condition,
                                  index
                                )
                              }
                              getRelativeMedications={(
                                medications
                              ) =>
                                getRelativeMedications(
                                  medications,
                                  index
                                )
                              }
                              style={{ marginTop: "1vh" }}
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <></>
                    )}

                    {currentPage == 3 ? (
                      <div>
                        <div style={{ float: "right" }}>
                          <button
                            className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            type="button"
                            onClick={
                              handleRemoveClickVaccine
                            }
                          >
                            Remove
                          </button>
                          <button
                            className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            type="button"
                            style={{ marginLeft: "1vw" }}
                            onClick={handleAddClickVaccine}
                          >
                            Add Form
                          </button>
                        </div>
                        {vaccinationList.map(
                          (vaccinationHistory, index) => (
                            <Vaccination
                              key={index}
                              vaccineType={
                                vaccinationHistory.vaccineType
                              }
                              vaccineBrand={
                                vaccinationHistory.vaccineBrand
                              }
                              vaccineDate={
                                vaccinationHistory.vaccineDate
                              }
                              vaccineRemarks={
                                vaccinationHistory.vaccineRemarks
                              }
                              getVaccineType={(
                                vaccineType
                              ) =>
                                getVaccineType(
                                  vaccineType,
                                  index
                                )
                              }
                              getVaccineBrand={(
                                vaccineBrand
                              ) =>
                                getVaccineBrand(
                                  vaccineBrand,
                                  index
                                )
                              }
                              getVaccineDate={(
                                vaccineDate
                              ) =>
                                getVaccineDate(
                                  vaccineDate,
                                  index
                                )
                              }
                              getVaccineRemarks={(
                                vaccineRemarks
                              ) =>
                                getVaccineRemarks(
                                  vaccineRemarks,
                                  index
                                )
                              }
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <></>
                    )}

                    {currentPage == 4 ? (
                      <div>
                        <div style={{ float: "right" }}>
                          <button
                            className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            type="button"
                            onClick={
                              handleRemoveClickPersonal
                            }
                          >
                            Remove
                          </button>
                          <button
                            className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            type="button"
                            style={{ marginLeft: "1vw" }}
                            onClick={handleAddClickPersonal}
                          >
                            Add Form
                          </button>
                        </div>
                        {personalList.map(
                          (personalHistory, index) => (
                            <PersonalMedicalHistory
                              key={index}
                              historyType={
                                personalHistory.historyType
                              }
                              historyDate={
                                personalHistory.historyDate
                              }
                              historyRemarks={
                                personalHistory.historyRemarks
                              }
                              getHistoryType={(
                                historyType
                              ) =>
                                getHistoryType(
                                  historyType,
                                  index
                                )
                              }
                              getHistoryDate={(
                                historyDate
                              ) =>
                                getHistoryDate(
                                  historyDate,
                                  index
                                )
                              }
                              getHistoryRemarks={(
                                historyRemarks
                              ) =>
                                getHistoryRemarks(
                                  historyRemarks,
                                  index
                                )
                              }
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <></>
                    )}

                    <div className="flex justify-between mt-8">
                      <div></div>
                      <div
                        className="inline"
                        style={{ float: "right" }}
                      >
                        <button
                          className="p-3 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          type="buttom"
                          onClick={updatePatientInformation}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PatientList;
