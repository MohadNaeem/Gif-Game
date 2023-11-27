import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  getFirestore,
  doc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import app from "../../config/firebase";
import { useRecoilState } from "recoil";
import { Atom } from "../../Atom/Atom";
import gallery from "../../assets/svg/gallery.svg";
import galleryWhiteTheme from "../../assets/svg/galleryWhiteTheme.svg";
import Styles from "./index.module.css";

const storage = getStorage(app);
const db = getFirestore(app);

function FileUpload() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [comments, setComments] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useRecoilState(Atom);

  const userAuthID = localStorage.getItem("userAuthID");

  const handleBoxClick = () => {
    inputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5 MB");
    } else {
      setFile(selectedFile);
    }
  };

  const handleCommentChange = (e) => {
    setComments(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleUpload = async () => {
    if (comments === "") {
      setSuccessMessage("Please add some comment before you submit.");
    } else if (file) {
      setLoading(true);
      const storageRef = ref(storage, `reportedIssues/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // You can show the progress of the upload here
        },
        (error) => {
          // Handle unsuccessful uploads here
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setUrl(downloadURL);
            const issueRef = doc(db, "public", "reports");
            addDoc(collection(issueRef, "reportedIssues"), {
              url: downloadURL,
              comments: comments,
              userId: userAuthID,
              status: "unresolved",
              time: serverTimestamp(),
            }).then(() => {
              setSuccessMessage(
                "Issue Reported successfully, we will get back to you soon!"
              );
              setLoading(false);
            });
          });
        }
      );
    } else {
      const issueRef = doc(db, "public", "reports");
      addDoc(collection(issueRef, "reportedIssues"), {
        comments: comments,
        url: null,
        userId: userAuthID,
        status: "unresolved",
        time: serverTimestamp(),
      }).then(() => {
        setSuccessMessage(
          "Issue Reported successfully, we will get back to you soon!"
        );
      });
    }
  };

  return (
    <div>
      <textarea
        style={
          darkMode
            ? {
                border: "1px solid #F7931A",
                backgroundColor: "black",
                color: "#9E9E9E",
              }
            : {}
        }
        rows="3"
        cols="50"
        className="border border-gray-300 rounded-md w-full px-3 py-2 mb-6 shadow-sm"
        placeholder="Add your comments here"
        onChange={handleCommentChange}
      ></textarea>
      <br />
      <div
        className="mb-5"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <div
          className="mb-2 text-sm px-1"
          style={
            darkMode
              ? { color: "white", textAlign: "center", fontSize: "0.875rem" }
              : {}
          }
        >
          Upload screenshot or related document (optional)
        </div>
        <input
          onChange={handleFileChange}
          className="relative block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding py-[0.32rem] px-3 text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100  file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[margin-inline-end:0.75rem] file:[border-inline-end-width:1px] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-[0_0_0_1px] focus:shadow-primary focus:outline-none shadow-sm cursor-pointer"
          type="file"
          id="formFile"
          ref={inputRef}
          style={{ display: "none" }}
        />

        <div
          className={
            darkMode
              ? Styles.Pick_Image_Section
              : Styles.Pick_Image_White_Section
          }
          onClick={handleBoxClick}
        >
          {darkMode ? (
            <img src={gallery} alt="" />
          ) : (
            <img src={galleryWhiteTheme} />
          )}
          <p>Drag & drop or click to upload</p>
        </div>
      </div>
      <br />
      <div className="flex justify-center mb-3">
        <button
          onClick={handleUpload}
          className="w-fit bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm"
          style={
            darkMode
              ? {
                  borderRadius: "0.625rem",
                  border: "1.5px solid #0FBE00",
                  background:
                    "linear-gradient(180deg, rgba(15, 190, 0, 0.50) 27.27%, rgba(15, 190, 0, 0.00) 145.45%)",
                  boxShadow: "0px 1px 1px 0px rgba(15, 190, 0, 0.50)",
                }
              : {}
          }
        >
          {loading ? <span>Sending...</span> : <span>Submit</span>}
        </button>
      </div>
      <span className="">
        {successMessage &&
        successMessage === "Please add some comment before you submit." ? (
          <p className="text-center text-sm text-red-500 font-semibold">
            {successMessage}
          </p>
        ) : (
          <p className="text-center text-sm text-green-500 font-semibold">
            {successMessage}
          </p>
        )}
      </span>
    </div>
  );
}

export default FileUpload;
