import { useNavigate } from "react-router-dom";
import './ClinicAdminDashboard.css'
import { user, db, config, signInAuth } from '../../../firebase/Firebase'
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import RequiredAsterisk from "./staffForm/components/asterisk";
import { createUserWithEmailAndPassword, signOut, getAuth } from "firebase/auth";
import emailjs, { send } from 'emailjs-com';


function ClinicAdminDashboard() {
    const [adminName, setAdminName] = useState("")
    const [clinicName, setClinicName] = useState("")
    const [selected, setSelected] = useState("dashboard")
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        emailFormatted: '',
        password: '',
        clinicName: '',
    });
    const navigate = useNavigate();

    function changeSelected(selected) {
        setSelected(selected)
    }

    function formatEmail(email) {
        const [localPart] = email.split('@');
        const newEmail = `${localPart}@healthcare.staff.com`;
        return newEmail;
    }

        
    function isPasswordComplex(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}[\]|:;"'<>,.?/~`]).{12,}$/;
        return regex.test(password);
    }


    useEffect(() => {
        try {
            async function getClinicName() {
                const unsubscribe = onAuthStateChanged(config.auth, async (user) => {
                    if (user) {
                        const docRef = doc(db, "clinicAdmins", user.uid);
                        const docSnap = await getDoc(docRef);

                        if (docSnap.exists()) {
                            setClinicName(docSnap.data().clinicName);
                        } else {
                            console.log("No such document!");
                        }
                    }
                })
            }
            getClinicName();
        } catch (error) {
            console.log(error);
        }

        try {

            async function getAdminName() {
                const unsubscribe = onAuthStateChanged(config.auth, async (user) => {
                    if (clinicName && user) {
                        const docRef = doc(db, clinicName, "admin");
                        const docSnap = await getDoc(docRef);

                        if (docSnap.exists()) {
                            setAdminName(docSnap.data().firstname + " " + docSnap.data().lastname);
                            console.log(adminName);
                        } else {
                            console.log("No such document!");
                        }
                    }
                })
            }

            getAdminName();
        } catch (error) {
            console.log(error);
        }
    }, [user.uid, clinicName]);

    async function initializeClinic(e) {
        e.preventDefault();

        const firstName = e.target['first-name'].value;
        const lastName = e.target['last-name'].value;
        const email = e.target['email'].value;
        const password = e.target['password'].value;
        const emailFormatted = formatEmail(email);

        if (!isPasswordComplex(password)) {
            alert("Password must be at least 12 characters long and include an uppercase letter, lowercase letter, number, and special character.");
            return; 
        }

        setFormData({
            ...formData,
            firstName,
            lastName,
            email,
            emailFormatted,
            password,
        });
    }

    useEffect(() => {
        if (formData.email) {
            try {
                // EMAIL CREDENTIALS
                function sendEmail() {
                    emailjs
                        .send(
                            'service_t8pkk4o',
                            'template_x65vfmj',
                            formData,
                            'guzJ5EN-eKEHV_0jW'
                        )
                        .then(
                            (result) => {
                                console.log('Email sent:', result.text);
                                alert('Email sent successfully!');
                            },
                            (error) => {
                                console.error('Email error:', error.text);
                                alert('Failed to send email.');
                            }
                        );
                }

                getDoc(doc(config.firestore, "clinicAdmins", config.auth.currentUser.uid))
                    .then((docSnapshot) => {
                        if (docSnapshot.exists()) {
                            // The document exists
                            const data = docSnapshot.data();
                            console.log("Document data:", data);

                            // Now you can access individual fields within the document
                            const clinicName = data.clinicName;
                            createUserWithEmailAndPassword(signInAuth.auth, formData.emailFormatted, formData.password)
                                .then((userCredential) => {
                                    setDoc(doc(config.firestore, "clinicStaffs", userCredential.user.uid), {
                                        clinicName: clinicName,
                                    });

                                    setDoc(doc(config.firestore, clinicName, "staff", "staffList", userCredential.user.uid), {
                                        firstname: formData.firstName,
                                        lastname: formData.lastName,
                                        email: formData.email
                                    });
                                    sendEmail();
                                    // SignOut 2nd authentication
                                    signOut(getAuth(signInAuth.auth)).then(() => {
                                        // Sign-out successful.
                                    }).catch((error) => {
                                        // An error happened.
                                    });
                                    // ...
                                })
                                .catch((error) => {
                                    console.error("Error creating user:", error.message);
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


    return (
        <div className="h-screen w-full flex overflow-hidden bg-white">
            <Sidebar selected={selected} name={adminName} changeSelected={changeSelected} />
            {selected == "dashboard" ? (
                <div style={{ float: "left", width: "100vh", height: "100vh", marginLeft: "5vw", marginTop: "13vh" }}>
                    <h1 className="text-4xl exo">Welcome Back, {adminName}</h1>
                    <div className="mt-10" style={{ width: "70vw", height: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <div onClick={() => navigate('./stafflist')} className='Pdashboard-Card-BoxShadow' style={{ border: "2px solid #00008B", backgroundColor: "#FBF7F4", width: "35%", height: "100%", borderRadius: "20px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                            <div style={{ border: "2px solid #00008B", background: "linear-gradient(to bottom, #F6FFF0, #87CEEB)", width: "60%", height: "50%", borderRadius: "10px" }}>

                            </div>
                            <br />
                            <span class="ml-3 text-blue-900 text-2xl text-center font-semibold">View Staff<br />List</span>
                        </div>

                        <div className='Pdashboard-Card-BoxShadow' style={{ border: "2px solid #00008B", backgroundColor: "#FBF7F4", width: "35%", height: "100%", borderRadius: "20px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginLeft: "8vh" }}>
                            <div onClick={() => setShowForm(true)} style={{ border: "2px solid #00008B", background: "linear-gradient(to bottom, #F6FFF0, #87CEEB)", width: "60%", height: "50%", borderRadius: "10px" }}>

                            </div>
                            <br />
                            <span class="ml-3 text-blue-900 text-2xl text-center font-semibold">Add New <br />Staff</span>
                        </div>
                    </div>
                </div>
            ) : (
                <></>
            )}

            {selected == "profile" ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", marginLeft: "13vw" }}>
                    <div style={{ position: "relative", width: "60vw", height: "20vh" }}>
                        <div style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            background: "linear-gradient(to bottom right, #2657B7, #A5E4FF)",
                            borderRadius: "20px",
                            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
                        }}>
                            <div
                                onClick={() => setShowForm((prevShowForm) => !prevShowForm)}
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
                                <p style={{ fontSize: "24px", fontWeight: "bold" }}>Fullname: {adminName}</p>
                                <p style={{ fontSize: "18px" }}>Clinic: {clinicName}</p>
                                <p style={{ fontSize: "18px" }}>Position: Clinic Staff</p>
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
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                    d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                            </svg>
                        </div>
                        <nav class="relative flex flex-col py-4 items-center">
                            <a href="#" class="relative w-16 p-4 bg-purple-100 text-purple-900 rounded-2xl mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                        d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                                </svg>
                                <span
                                    class="absolute -top-2 -right-2 bg-red-600 h-6 w-6 p-2 flex justify-center items-center text-white rounded-full">3</span>
                            </a>
                            <a href="#" class="w-16 p-4 border text-gray-700 rounded-2xl mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            </a>
                            <a href="#" class="w-16 p-4 border text-gray-700 rounded-2xl mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </a>
                            <a href="#" class="w-16 p-4 border text-gray-700 rounded-2xl mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </a>
                            <a href="#" class="w-16 p-4 border text-gray-700 rounded-2xl mb-24">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </a>
                            <a href="#" class="w-16 p-4 border text-gray-700 rounded-2xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </a>
                        </nav>
                    </section>
                    <section class="flex flex-col pt-3 w-4/12 bg-gray-50 h-full overflow-y-scroll">
                        <label class="px-3">
                            <input class="rounded-lg p-4 bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 w-full"
                                placeholder="Search..." />
                        </label>

                        <ul class="mt-6">
                            <li class="py-5 border-b px-3 transition hover:bg-indigo-100">
                                <a href="#" class="flex justify-between items-center">
                                    <h3 class="text-lg font-semibold">{adminName}</h3>
                                    <p class="text-md text-gray-400">23m ago</p>
                                </a>
                                <div class="text-md italic text-gray-400">Patient Appointment Reminder!</div>
                            </li>
                            <li class="py-5 border-b px-3 transition hover:bg-indigo-100">
                                <a href="#" class="flex justify-between items-center">
                                    <h3 class="text-lg font-semibold">{adminName}</h3>
                                    <p class="text-md text-gray-400">23m ago</p>
                                </a>
                                <div class="text-md italic text-gray-400">Patient Appointment Reminder!</div>
                            </li>
                            <li class="py-5 border-b px-3 transition hover:bg-indigo-100">
                                <a href="#" class="flex justify-between items-center">
                                    <h3 class="text-lg font-semibold">{adminName}</h3>
                                    <p class="text-md text-gray-400">23m ago</p>
                                </a>
                                <div class="text-md italic text-gray-400">Patient Appointment Reminder!</div>
                            </li>
                            <li class="py-5 border-b px-3 transition hover:bg-indigo-100">
                                <a href="#" class="flex justify-between items-center">
                                    <h3 class="text-lg font-semibold">{adminName}</h3>
                                    <p class="text-md text-gray-400">23m ago</p>
                                </a>
                                <div class="text-md italic text-gray-400">Patient Appointment Reminder!</div>
                            </li>
                            <li class="py-5 border-b px-3 bg-indigo-600 text-white">
                                <a href="#" class="flex justify-between items-center">
                                    <h3 class="text-lg font-semibold">{adminName}</h3>
                                    <p class="text-md">23m ago</p>
                                </a>
                                <div class="text-md">Patient Appointment Reminder!</div>
                            </li>
                            <li class="py-5 border-b px-3 transition hover:bg-indigo-100">
                                <a href="#" class="flex justify-between items-center">
                                    <h3 class="text-lg font-semibold">{adminName}</h3>
                                    <p class="text-md text-gray-400">23m ago</p>
                                </a>
                                <div class="text-md italic text-gray-400">Patient Appointment Reminder!</div>
                            </li>
                            <li class="py-5 border-b px-3 transition hover:bg-indigo-100">
                                <a href="#" class="flex justify-between items-center">
                                    <h3 class="text-lg font-semibold">{adminName}</h3>
                                    <p class="text-md text-gray-400">23m ago</p>
                                </a>
                                <div class="text-md italic text-gray-400">Patient Appointment Reminder!</div>
                            </li>
                        </ul>
                    </section>
                    <section class="w-6/12 px-4 flex flex-col bg-white rounded-r-3xl">
                        <div class="flex justify-between items-center h-48 border-b-2 mb-8">
                            <div class="flex space-x-4 items-center">
                                <div class="h-12 w-12 rounded-full overflow-hidden">
                                    <img src="https://bit.ly/2KfKgdy" loading="lazy" class="h-full w-full object-cover" />
                                </div>
                                <div class="flex flex-col">
                                    <h3 class="font-semibold text-lg">Alexandar Gomez</h3>
                                    <p class="text-light text-gray-400">AlexGomez@gmail.com</p>
                                </div>
                            </div>
                            <div>
                                <ul class="flex text-gray-400 space-x-4">
                                    <li class="w-6 h-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                                        </svg>
                                    </li>
                                    <li class="w-6 h-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </li>

                                    <li class="w-6 h-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                    </li>
                                    <li class="w-6 h-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </li>
                                    <li class="w-6 h-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <section>
                            <h1 class="font-bold text-2xl">Shuan Co | Patient Appointment | Heart Surgery Required</h1>
                            <article class="mt-8 text-gray-500 leading-7 tracking-wider">
                                <p>Hi {adminName},</p>
                                <p>I hope this email finds you well. I wanted to reach out to you with some important medical information regarding the patient's recent examination and test results.

                                    After a thorough evaluation, our medical team has determined that you require immediate attention due to a significant heart condition. It has been advised by our expert cardiologists that the patient undergo heart surgery without any further delay.

                                    The procedure we recommend is known as Coronary Artery Bypass Grafting (CABG) to address the blockages in your coronary arteries. This surgery is essential to ensure the proper blood supply to the patient's heart muscles and to prevent any further complications.</p>
                                <footer class="mt-12">
                                    <p>Thanks & Regards,</p>
                                    <p>Dr. Alexandar MD</p>
                                </footer>
                            </article>
                            <ul class="flex space-x-4 mt-12">
                                <li
                                    class="w-10 h-10 border rounded-lg p-1 cursor-pointer transition duration-200 text-indigo-600 hover:bg-blue-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                </li>
                                <li
                                    class="w-10 h-10 border rounded-lg p-1 cursor-pointer transition duration-200 text-blue-800 hover:bg-blue-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                    </svg>
                                </li>
                                <li
                                    class="w-10 h-10 border rounded-lg p-1 cursor-pointer transition duration-200 text-pink-400 hover:bg-blue-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                    </svg>
                                </li>
                                <li
                                    class="w-10 h-10 border rounded-lg p-1 cursor-pointer transition duration-200 text-yellow-500 hover:bg-blue-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                                    </svg>
                                </li>
                            </ul>
                        </section>
                        <section class="mt-6 border rounded-xl bg-gray-50 mb-3">
                            <textarea class="w-full bg-gray-50 p-2 rounded-xl" placeholder="Type your reply here..." rows="3"></textarea>
                            <div class="flex items-center justify-between p-2">
                                <button class="h-6 w-6 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>
                                <button class="bg-purple-600 text-white px-6 py-2 rounded-xl">Reply</button>
                            </div>
                        </section>
                    </section>
                </main>
            ) : (
                <></>
            )}


            {showForm && (
                <div className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full shadow-2xl drop-shadow-2xl border border-black">
                    <div className="relative w-full max-w-2xl max-h-full mx-auto">
                        <div className="flex items-start justify-between p-4 border-b rounded-t bg-blue-800">
                            <h3 className="text-xl font-semibold text-white-900 dark:text-white">
                                Add User
                            </h3>
                            <button
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-slate-50 dark:hover:text-black"
                                onClick={() => setShowForm(false)}
                            >
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>

                        <div className="relative bg-slate-50 shadow exo">
                            <div className="p-6 space-y-6">
                                <form onSubmit={initializeClinic}>
                                    <div className="border-b border-gray-900/10 pb-12">

                                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                            <div className="sm:col-span-3">
                                                <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-black">
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
                                                <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-black">
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
                                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-black">
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
                                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-black">
                                                    Password <RequiredAsterisk />
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        id="password"
                                                        autoComplete="current-password"
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10 flex justify-end">
                                            <button
                                                className="rounded-md bg-indigo-600 p-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default ClinicAdminDashboard;
