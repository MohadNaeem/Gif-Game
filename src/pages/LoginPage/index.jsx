import omoLogo from "../../assets/img/omo-logo.png";
import { GoogleIcon } from "../../assets/icons";
import mobileGif from "../../assets/gif/mobile.gif";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import app from "../../config/firebase";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirestore, getDoc, doc, setDoc } from "firebase/firestore";

import { useLoginInValidator } from "./useLoginValidator.js";
import InputWithLabel from "../../components/InputFieldWithLabel";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { Atom } from "../../Atom/Atom.jsx";
import CustomFlagSelect from "../../components/CustomFlagSelect";
import OmoLogo from "../../assets/gif/OMOGif.gif";

const auth = getAuth(app);
const fireStore = getFirestore(app);

const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    login_hint: "user@example.com",
  });
  signInWithPopup(auth, provider);
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState("");
  const [showForgotPasswordPage, setShowForgotPasswordPage] = useState(false);
  const [emailFP, setEmailFP] = useState("");
  const [errorFP, setErrorFP] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mailFPsent, setMailFPsent] = useState(false);
  const [displayFlag, setDisplayFlag] = useState(false);
  const [darkMode, setDarkMode] = useRecoilState(Atom);

  const [userAuth] = useAuthState(auth);

  const navigate = useNavigate();

  const {
    fields,
    trigger,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useLoginInValidator();

  function shortenId(longId) {
    const alphanumericOnly = longId.replace(/[^a-zA-Z0-9]/g, "");
    const shortId = alphanumericOnly.substring(0, 8);
    return shortId;
  }

  function getServerTime() {
    return Math.floor(Date.now() / 1000);
  }

  const handleUserAuthenticated = () => {
    const userRef = doc(fireStore, "users", userAuth.uid);
    setDoc(userRef, {
      email: userAuth.email,
      name: userAuth.displayName,
      tokenBalance: 0,
      bonusBalance: 10,
      shortID: shortenId(userAuth.uid),
      registeredAt: getServerTime(),
    });

    localStorage.setItem("userAuthID", userAuth.uid);
    navigate("/live");
  };

  useEffect(() => {
    if (userAuth) {
      if (userAuth.providerData[0].providerId === "google.com") {
        getDoc(doc(fireStore, "users", userAuth.uid))
          .then((docSnapshot) => {
            if (docSnapshot.exists()) {
              localStorage.setItem("userAuthID", userAuth.uid);
              navigate("/live");
            } else {
              handleUserAuthenticated();
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error checking user:", error);
          });
      } else if (userAuth.email === "omo6042game@gmail.com") {
        localStorage.setItem("adminAuthID", userAuth.uid);
        navigate("/admin/activeUsers");
        setLoading(false);
      } else if (userAuth.email === "rainy8882399321@gmail.com") {
        localStorage.setItem("adminAuthID", userAuth.uid);
        navigate("/admin/activeUsers");
        setLoading(false);
      } else {
        localStorage.setItem("userAuthID", userAuth.uid);
        navigate("/live");
        setLoading(false);
      }
    }
  }, [userAuth]);

  const onSubmitLogIn = () => {
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // handle successful sign in
      })
      .catch((error) => {
        if (error.code === "auth/wrong-password") {
          setAuthError("Wrong Password. Please try again.");
        } else if (error.code === "auth/user-not-found") {
          setAuthError("User with this email address does not exist");
        } else
          setAuthError(
            error.message.substring(9).split(new RegExp("\\((.*)\\)"))[0]
          );
        setLoading(false);
      });
  };

  const handleRestorePasswordClick = async () => {
    try {
      if (!/\S+@\S+\.\S+/.test(emailFP)) {
        setErrorFP(true);
        setErrorMsg("Please enter valid email address");
      }
      await sendPasswordResetEmail(auth, emailFP);
      setMailFPsent(true);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setErrorFP(true);
        setErrorMsg("This user account does not exist");
      } else {
        console.log("Error sending password reset email:", error);
      }
    }
  };

  const handleInputFPclick = (e) => {
    setEmailFP(e.target.value);
    setErrorFP(false);
  };

  const laguangeHandler = () => {
    setDisplayFlag(!displayFlag);
  };

  return (
    <div
      className="lg:w-full lg:h-[100vh] flex"
      style={darkMode ? { backgroundColor: "black",height:'100vh' } : {}}
    >
      <div className="w-full px-8 md:w-[70%] md:mx-auto lg:w-[35%] lg:px-[50px]">
        <div class="container">
          <CustomFlagSelect />
        </div>
        <div className="w-full flex justify-center py-[25px]">
          {darkMode ? (
            <img src={OmoLogo} style={{ width:'15rem' }} />
          ) : (
            <img src={omoLogo} className="h-[75px] w-[250px]" />
          )}
        </div>

        {showForgotPasswordPage ? (
          <div>
            <div
              className="font-medium text-lg mb-4 text-center"
              style={darkMode ? { color: "white" } : {}}
            >
              Forgot your password?
            </div>
            {mailFPsent ? (
              <div className="my-7 text-sm sm:text-md text-center">
                <div>Message has been sent to {emailFP}.</div>
                <p>
                  Please check your email and follow the link to restore your
                  account and password.
                </p>
              </div>
            ) : (
              <div>
                <div
                  className="mb-5"
                  style={darkMode ? { color: "white" } : {}}
                >
                  Enter your email and we'll send you a link to reset password
                  and get back into your account.
                </div>
                <div className="mb-5">
                  <div className="mb-4">
                    <label
                      className="font-medium text-[14px] flex mb-[3px]"
                      style={darkMode ? { color: "white" } : {}}
                    >
                      Email <div className="text-red-700">*</div>
                    </label>
                    <input
                      className={`block text-[14px] appearance-none rounded-[3px] text-[#182021] font-normal placeholder-gray-400 border p-[8px]
                     hover:outline-none hover:ring-0 
                    ${
                      !errorFP
                        ? "hover:border-[#00A1FF] hover:ring-[#00A1FF] border-gray-300 focus:border-[#00A1FF] hover:ring-[1px] focus:ring-[#00A1FF]"
                        : "hover:border-[#D86161] hover:ring-[#D86161] border-[#D86161] focus:border-[#D86161] focus:ring-[#D86161]"
                    }
                    focus:outline-none focus:ring-[1.5px]`}
                      style={
                        darkMode
                          ? {
                              border: "1px solid #F7931A",
                              width: "100%",
                              background: "#000",
                              boxShadow:
                                "0px 1px 1px 0px rgba(247, 147, 26, 0.50)",
                              width: `100%`,
                              height: `33px`,
                            }
                          : { width: `100%`, height: `33px` }
                      }
                      placeholder="someone@example.com"
                      value={emailFP}
                      onChange={(e) => handleInputFPclick(e)}
                    />
                    {errorFP && (
                      <div className="text-[12px] text-red-700">{errorMsg}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-[10px] text-white bg-[#000000] hover:bg-gray-800 focus:outline-none font-medium rounded-md px-5 py-2.5 mr-2 mb-2"
                    onClick={handleRestorePasswordClick}
                    style={
                      darkMode
                        ? {
                            border: "1px solid #DD7900",
                            width: "55%",
                            transform: "skew(-25deg)",
                            backgroundColor: "#F7931A",
                            borderRadius: "0",
                            position: "relative",
                            left: "22%",
                          }
                        : {}
                    }
                  >
                    Restore Password
                    {darkMode && (
                      <div
                        style={{
                          border: "3px solid black",
                          width: "13.6rem",
                          height: "4.5rem",
                          position: "absolute",
                          top: "-0.8rem",
                          left: "1.1rem",
                          transform: "skew(-6deg)",
                        }}
                      ></div>
                    )}
                  </button>
                </div>
              </div>
            )}
            <div className="w-full flex justify-center">
              <div
                className="text-[#00A1FF] text-sm font-semibold hover:underline cursor-pointer"
                style={
                  darkMode
                    ? {
                        color: "white",
                        fontWeight: "700",
                        gap: "0.35rem",
                        display: "flex",
                        alignItems: "center",
                        textDecoration: "none",
                      }
                    : {}
                }
              >
                Back to{" "}
                <span
                  onClick={() => setShowForgotPasswordPage(false)}
                  style={
                    darkMode
                      ? {
                          border: "2px solid #0FBE00",
                          width: "8rem",
                          textAlign: "center",
                          borderRadius: "0.625rem",
                          height: "2.5rem",
                          background:
                            "linear-gradient(180deg, rgba(15, 190, 0, 0.50) 27.27%, rgba(15, 190, 0, 0.00) 145.45%)",
                          boxShadow: " 0px 1px 1px 0px rgba(15, 190, 0, 0.50)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          textDecoration: "underline",
                        }
                      : {}
                  }
                >
                  Sign in
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <form
              onSubmit={handleSubmit(onSubmitLogIn)}
              className="flex flex-col"
            >
              <div className="mb-[14px]">
                <InputWithLabel
                  name="email"
                  labelText="Email"
                  labelTextSize="14px"
                  marginLabelField="4px"
                  labelStyling="font-[500] text-gray-500"
                  isRequired={true}
                  placeholderText="someone@example.com"
                  height="36px"
                  width="100%"
                  setValue={setValue}
                  validation={{ ...fields.email }}
                  errors={errors.email}
                  trigger={trigger}
                  onChangeTrigger={false}
                  inputState={email}
                  setInputState={setEmail}
                />
              </div>

              <div className="mb-[14px]">
                <InputWithLabel
                  name="password"
                  labelText="Password"
                  labelTextSize="14px"
                  marginLabelField="4px"
                  labelStyling="font-[500] text-gray-500"
                  inputType="password"
                  isRequired={true}
                  placeholderText="Enter Password"
                  height="36px"
                  width="100%"
                  setValue={setValue}
                  validation={{ ...fields.password }}
                  errors={errors.password}
                  trigger={trigger}
                  inputState={password}
                  setInputState={setPassword}
                />
              </div>

              {authError && (
                <div className="text-[14px] text-[#D86161]">{authError}</div>
              )}

              <button
                type="submit"
                className="w-full mt-[10px] text-white bg-[#000000] hover:bg-gray-800 focus:outline-none font-medium rounded-md px-5 py-2.5 mr-2 mb-2"
                style={
                  darkMode
                    ? {
                        border: "1px solid #DD7900",
                        width: "55%",
                        alignSelf: "center",
                        transform: "skew(-25deg)",
                        backgroundColor: "#F7931A",
                        borderRadius: "0",
                        position: "relative",
                      }
                    : {}
                }
              >
                {loading ? "Loading..." : "Sign in"}

                {darkMode && (
                  <>
                    <div
                      style={{
                        border: "2px solid black",
                        // width:'83%',
                        height: "4.5rem",
                        position: "absolute",
                        top: "-0.8rem",
                        left: "1.1rem",
                        transform: "skew(-6deg)",
                      }}
                    ></div>
                    <div
                      style={{
                        border: "2px solid black",
                        // width:'83%',
                        height: "4.5rem",
                        position: "absolute",
                        top: "-0.8rem",
                        right: "1.1rem",
                        transform: "skew(-6deg)",
                      }}
                    ></div>
                  </>
                )}
              </button>
            </form>

            <div className="w-full flex justify-center text-[#00A1FF] mt-3">
              <div className="w-fit text-[#00A1FF] text-sm font-semibold hover:underline cursor-pointer">
                <div onClick={() => setShowForgotPasswordPage(true)}>
                  Forgot Password?
                </div>
              </div>
            </div>

            <div className="flex my-[20px] md:my-[10px]">
              <hr className="w-[45%] mt-[9px] h-[2px] mx-auto bg-gray-300 border-0 rounded lg:my-7" />
              <span className="text-gray-500 text-[13px] lg:my-5">or</span>
              <hr className="w-[45%] mt-[9px] h-[2px] mx-auto  bg-gray-300 border-0 rounded lg:my-7" />
            </div>

            {/* <button
              type="button"
              className="text-center text-gray-700 bg-white w-full hover:bg-gray-100 text-[17px] border border-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-md py-2.5 text-center inline-flex items-center"
              onClick={signInWithGoogle}
            >
              <div className="flex w-full justify-center">
                <GoogleIcon className="w-[21px] mr-[10px]" />
                Sign in with Google
              </div>
            </button> */}

            <div
              className="w-full flex justify-center my-7 text-gray-700"
              style={darkMode ? { alignItems: "center" } : {}}
            >
              <span
                className="mr-[5px]"
                style={darkMode ? { color: "white", fontWeight: "600" } : {}}
              >
                Don't have an account?
              </span>
              <Link
                to="/signup"
                style={
                  darkMode
                    ? {
                        border: "2px solid #0FBE00",
                        width: "8rem",
                        textAlign: "center",
                        borderRadius: "0.625rem",
                        height: "2.5rem",
                        background:
                          "linear-gradient(180deg, rgba(15, 190, 0, 0.50) 27.27%, rgba(15, 190, 0, 0.00) 145.45%)",
                        boxShadow: " 0px 1px 1px 0px rgba(15, 190, 0, 0.50)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }
                    : {}
                }
              >
                <span
                  className="text-[#00A1FF] font-bold hover:underline"
                  style={darkMode ? { color: "white" } : {}}
                >
                  Sign up
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
      {/* <div className="hidden lg:block lg:w-[60%] bg-black">
        <img src={mobileGif} className="h-[90vh] mx-auto mt-8 rounded-lg" />
      </div> */}
    </div>
  );
};

export default LoginPage;
