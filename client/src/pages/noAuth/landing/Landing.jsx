import React from "react";
import landPage1 from "./landPage1.png";
import landPage2 from "./landPage2.png";
import landPage3 from "./landPage3.png";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();
  const navigateLogin = () => {
    navigate("/login");
  };
  return (
    <div>
      <div className="grid grid-cols-2 border-b border-black h-min">
        <div className="px-3 ">
          <div className="flex items-center m-20">
            <div className="w-auto justify-start mr-8">
              <p className="text-5xl arvo mb-2 ">
                Healthcare Management and Logistics
              </p>
              <p className="text-xl arvo">
                Empowering Healthcare Excellence: Welcome to
                our Healthcare Management System, where
                innovation meets precision in optimizing
                patient care, streamlining operations, and
                advancing healthcare administration.
                Experience the future of healthcare
                management with us.
              </p>
            </div>
          </div>
        </div>
        <div
          className="flex justify-center items-center bg-center bg-cover"
          style={{ backgroundImage: `url(${landPage1})` }}
        >
          <div className="flex w-2/3 justify-center items-center">
            <form
              id="shadow"
              action=""
              className="bg-slate-50 h-auto w-full rounded-lg p-10 mx-auto bg-purple-200 transition-opacity"
            >
              <p className="exo font-bold text-2xl mb-4 text-center">
                Sign In Now!
              </p>
              <button
                onClick={navigateLogin}
                className="rounded-full bg-white w-full text-xl 
                  h-14 font-bold lato hover:bg-pink-300 transition-opacity"
              >
                Log In{" "}
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 border-b border-black h-max">
        <div
          className="bg-center bg-cover px-3"
          style={{ backgroundImage: `url(${landPage2})` }}
        ></div>
        <div>
          <div className="flex items-center justify-center mt-20 mb-20">
            <div className="w-1/2">
              <p className="text-5xl arvo mb-5 text-end">
                Made for clinics.
              </p>
              <p className="text-xl arvo text-end">
                Elevate your clinic's efficiency and patient
                care with our system. Streamline schedule,
                tracking, simplify appointment scheduling,
                and enchance patient management
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 border-b border-black h-max">
        <div className=" bg-center bg-cover px-3 ">
          <div className="flex items-center mt-20 mb-20 justify-center">
            <div className="w-1/2">
              <p className="text-5xl arvo mb-5 text-start">
                Made for patients.
              </p>
              <p className="text-xl arvo text-start">
                Experience healthcare designed for you. We
                provide you with easy access to your
                mideical records, appointments, and
                communications. Your wellness is our
                priority
              </p>
            </div>
          </div>
        </div>
        <div
          className="bg-center bg-cover px-3"
          style={{ backgroundImage: `url(${landPage3})` }}
        ></div>
      </div>
      {/* <div className="border-b border-black py-1 px-3 bg-white">
        <div className="flex items-center m-8 justify-center">
          <div className="w-1/4">
            <p className="text-5xl arvo text-start">Made for patients.</p>
          </div>
        </div>
      </div>
      <div className="border-b border-black py-1 px-3 bg-white">
        <div className="flex items-center m-8 justify-center">
          <div className="w-1/4">
            <p className="text-5xl arvo text-start">Made for patients.</p>
            <h3>Streamlined Patient Records</h3>
            <p>Efficiently create, view, and update patient records, ensuring comprehensive and readily accessible patient information.</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default Landing;
