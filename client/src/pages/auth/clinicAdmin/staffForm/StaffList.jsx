import {
  config,
  signInAuth,
  db,
} from "../../../../firebase/Firebase";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signOut,
  getAuth,
} from "firebase/auth";
import { useState, useEffect } from "react";
import RequiredAsterisk from "./components/asterisk";
import emailjs, { send } from "emailjs-com";
import "./StaffList.css";
import Sidebar from "../../components/Sidebar";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { generateTemporaryPassword } from "../../../../utils/PasswordGenerator";

const searchIcon = (
  <FontAwesomeIcon icon={faMagnifyingGlass} />
);

function StaffList() {
  const [adminName, setAdminName] = useState("");
  const [selected, setSelected] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [searchName, setSearchName] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    emailFormatted: "",
    password: "",
    clinicName: "",
  });

  function formatEmail(email) {
    const [localPart] = email.split("@");
    const newEmail = `${localPart}@healthcare.staff.com`;
    return newEmail;
  }

  function changeSelected(selected) {
    setSelected(selected);

    if (selected == "dashboard") {
      navigate("../clinic-admin");
    }
  }

  async function initializeClinic(e) {
    e.preventDefault();

    const firstName = e.target["first-name"].value;
    const lastName = e.target["last-name"].value;
    const email = e.target["email"].value;
    const emailFormatted = formatEmail(email);

    // Generate secure temporary password automatically
    const tempPassword = generateTemporaryPassword(12);

    setFormData({
      ...formData,
      firstName,
      lastName,
      email,
      emailFormatted,
      password: tempPassword,
    });
  }

  useEffect(() => {
    if (formData.email) {
      try {
        // EMAIL CREDENTIALS
        function sendEmail() {
          emailjs
            .send(
              "service_wck5i1f",
              "template_odoejph",
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
            "clinicAdmins",
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
                      "clinicStaffs",
                      userCredential.user.uid
                    ),
                    {
                      clinicName: clinicName,
                    }
                  );

                  setDoc(
                    doc(
                      config.firestore,
                      clinicName,
                      "staff",
                      "staffList",
                      userCredential.user.uid
                    ),
                    {
                      firstname: formData.firstName,
                      lastname: formData.lastName,
                      email: formData.email,
                    }
                  );
                  sendEmail();
                  // SignOut 2nd authentication
                  signOut(getAuth(signInAuth.auth))
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

  const [showForm, setShowForm] = useState(false);

  getDoc(
    doc(
      config.firestore,
      "clinicAdmins",
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

  useEffect(() => {
    async function fetchStaff() {
      console.log(clinicName);
      if (clinicName) {
        const staffCollection = collection(
          config.firestore,
          clinicName,
          "staff",
          "staffList"
        );
        const staffSnapshot = await getDocs(
          staffCollection
        );
        const staffData = staffSnapshot.docs.map((doc) =>
          doc.data()
        );
        setStaffList(staffData);
        console.log(staffList);
      }
    }

    fetchStaff();
  }, [clinicName]);

  useEffect(() => {
    try {
      async function getAdminName() {
        const unsubscribe = onAuthStateChanged(
          config.auth,
          async (user) => {
            if (clinicName) {
              const docRef = doc(db, clinicName, "admin");
              const docSnap = await getDoc(docRef);

              if (docSnap.exists()) {
                setAdminName(
                  docSnap.data().firstname +
                    " " +
                    docSnap.data().lastname
                );
                console.log(adminName);
              } else {
                console.log("No such document!");
              }
            }
          }
        );
      }

      getAdminName();
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <>
      <div class="h-screen w-full flex overflow-hidden">
        <Sidebar
          selected={selected}
          name={adminName}
          changeSelected={changeSelected}
        />
        <div className="w-screen p-12">
          <div className="space-y-2 ">
            <h1 className="lato text-2xl">
              SEARCH RECORDS
            </h1>
            <input
              type="text"
              className="border border-black rounded-lg w-2/4 h-8 p-2"
              placeholder="Search by Last Name (e.g., Marcellana)"
              value={searchName}
              onChange={(e) =>
                setSearchName(e.target.value)
              }
            ></input>
            <div className="ms-3 inline">
              <button>{searchIcon}</button>
            </div>
          </div>

          <div className="relative w-full lato mt-5">
            <div className="grid grid-cols-4 bg-blue-800 rounded-t-lg text-white exo text-center p-3">
              <h1>ENTRY</h1>
              <h1>FIRST NAME</h1>
              <h1>LAST NAME</h1>
              <h1>EMAIL</h1>
            </div>

            <div className="bg-slate-100 rounded-b-lg">
              {staffList
                .filter(
                  (staff) =>
                    staff.lastname
                      .toLowerCase()
                      .includes(searchName.toLowerCase()) ||
                    staff.firstname
                      .toLowerCase()
                      .includes(searchName.toLowerCase())
                )
                .map((staff, index) => (
                  <div
                    className="grid grid-cols-4 text-center p-4 border border-black"
                    key={index}
                  >
                    <h3 className="font-bold">
                      {index + 1}
                    </h3>
                    <h3 className="capitalize">
                      {staff.firstname}
                    </h3>
                    <h3 className="capitalize">
                      {staff.lastname}
                    </h3>
                    <h3 className="capitalize">
                      {staff.email}
                    </h3>
                  </div>
                ))}
              <div className="w-full h-5"></div>
            </div>
          </div>
        </div>
      </div>
      {showForm && (
        <div className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-2xl max-h-full mx-auto">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-white-900 dark:text-white">
                  Add User
                </h3>
                <button
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
              <div className="p-6 space-y-6">
                <form onSubmit={initializeClinic}>
                  <div className="border-b border-gray-900/10 pb-12">
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="first-name"
                          className="block text-sm font-medium leading-6 text-white"
                        >
                          First name <RequiredAsterisk />
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="first-name"
                            id="first-name"
                            autoComplete="given-name"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                            required
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor="last-name"
                          className="block text-sm font-medium leading-6 text-white"
                        >
                          Last name <RequiredAsterisk />
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="last-name"
                            id="last-name"
                            autoComplete="last-name"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium leading-6 text-white"
                        >
                          Email <RequiredAsterisk />
                        </label>
                        <div className="mt-2">
                          <input
                            type="email"
                            name="email"
                            id="email"
                            autoComplete="email"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                            required
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-full">
                        <label className="block text-sm font-medium leading-6 text-white">
                          Temporary Password
                        </label>
                        <div className="mt-2">
                          <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded-md">
                            A secure temporary password will
                            be automatically generated and
                            sent to the user's email
                            address.
                          </div>
                          <p className="mt-1 text-xs text-gray-300">
                            The user will receive the
                            temporary password via email and
                            must change it on first login.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      <div className="sm:col-span-full">
                        <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mx-auto">
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
    </>
  );
}

export default StaffList;
