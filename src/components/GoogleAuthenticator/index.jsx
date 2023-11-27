import React, { useState } from 'react';
import app from "../../config/firebase";
import {getApp} from 'firebase/app';
// import firebase from 'firebase/app'; 
// import 'firebase/auth';
// import { authenticator } from 'otplib';
// import {nodemailer} from "nodemailer";
import {
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
} from "firebase/auth";
import { getAuth , PhoneMultiFactorGenerator, PhoneAuthProvider, multiFactor, GoogleAuthProvider,RecaptchaVerifier } from 'firebase/auth';

const MfaVerification = () => {


  
  // Specify the DOM element where you want the reCAPTCHA widget to be rendered
  // const recaptchaContainer = document.getElementById('recaptcha-container'); 

 

// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: 'omo6042game@gmail.com',
//     pass: 'omo123456',
//   },
// });

// const mailOptions = {
//   from: 'omo6042game@gmail.com',
//   to: 'rainy8882399321@gmail.com',
//   subject: 'Your OTP Code',
//   text: `Your OTP code is: 3456`,
// };



  const [otp, setOTP] = useState('');



const handleSendOtp = async () =>{

//   const firebase = getApp();
//   // const auth = getAuth();
//   console.log(firebase);
//   // const user = auth.currentUser;
//   // console.log("user", user);

// // Check if MFA is already enabled
// if (!user.multiFactor.enrolledFactors.some((factor) => factor.uid === 'google.com')) {
//   // Enroll the user with Google Authenticator
//   const provider = new firebase.auth.GoogleAuthProvider();

//   // Start the enrollment process
//   user
//     .multiFactor.getSession()
//     .then((session) => {
//       return session.multiFactor.enroll([provider]);
//     })
//     .then(() => {
//       console.log('Google Authenticator MFA enrollment successful');
//     })
//     .catch((error) => {
//       console.error('Error enrolling in Google Authenticator MFA:', error);
//     });
// } else {
//   console.log('Google Authenticator MFA is already enabled for this user');
// }


  const auth = getAuth();
  // const firebase = getApp();
  const user = auth.currentUser;

  console.log(user.multiFactor);

  const Multifactor = multiFactor(user);
//-----------------------------------------------------------------------------------//
//   // Check if MFA is already enabled
//   if (!Multifactor.enrolledFactors.some((factor) => factor.uid === 'google.com')) {
//     const appVerifier = new RecaptchaVerifier('recaptcha-container', {
//       size: 'invisible', // Set the reCAPTCHA size as per your UI design
//       // callback: (response) => {
//       //   // reCAPTCHA verification successful
//       //   // You can proceed with phone number verification here
//       // },
//       // 'expired-callback': () => {
//       //   // Handle reCAPTCHA expiration or verification failure
//       // },
//     }, auth);
//     // Enroll the user with Google Authenticator
//     const provider = new GoogleAuthProvider();
//     const multiFactorUser = multiFactor(auth.currentUser);


// const multiFactorSession = await multiFactorUser.getSession();
// const phoneNumber = "+919791093107";

//     // Send verification code.
// const phoneAuthProvider = new PhoneAuthProvider(auth);
// const phoneInfoOptions = {
//   phoneNumber: phoneNumber,
//   session: multiFactorSession
// };
// const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, appVerifier);

// // Obtain verification code from user.
// const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, "1234");
// const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
// const response  = await multiFactorUser.enroll(multiFactorAssertion);

//   // const multiFactorSession = await multiFactorUser.getSession();
//     // Start the enrollment process
//     // multiFactorUser.getSession()
//       // .then((session) => {
//     // const response = await multiFactorUser.enroll([provider]);
//     console.log(response);
//       // })
//       // .then(() => {
//       //   console.log('Google Authenticator MFA enrollment successful');
//       // })
//       // .catch((error) => {
//       //   console.error('Error enrolling in Google Authenticator MFA:', error);
//       // });
//   } else {
//     console.log('Google Authenticator MFA is already enabled for this user');
//   }
//-----------------------------------------------------------------------------------//

// const multiFactorAssertion = MultiFactorAssertion;

// // Generate a QR code for Google Authenticator enrollment
// const multiFactorInfoOptions = {
//   uid: user.uid,
//   displayName: 'Soundarya Dash', // Replace with the user's display name
// };

// const multiFactorInfo = await multiFactorAssertion.assert(
//   multiFactorAssertion.SUPPORTED_FACTORS.GOOGLE,
//   multiFactorInfoOptions
// );

// // Display the QR code to the user (you can use a QR code library for this)
// const qrCodeUrl = multiFactorInfo.mfaEnrollmentQrCode;




    // let response = await sendEmailVerification(user);
    // console.log(response);
    // .then(() => {
    //   // Email with OTP sent successfully
    //   console.log("Email with OTP sent successfully");
    // })
    // .catch((error) => {
    //   // Error sending the email, handle accordingly
    //   console.log("Error sending the email");
    // });

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error('Error sending email:', error);
    //   } else {
    //     console.log('Email sent:', info.response);
    //   }
    // });

}

  const handleVerify = async () => {
    const verificationCode = '123456'; // Replace with the code provided by the user
  const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(
      verificationCode,
      phoneInfo
  );

// Enroll the user in 2FA
try {
  await user.multiFactor.enroll([multiFactorAssertion], 'My Second Factor');
  console.log('2FA successfully enabled');
} catch (error) {
  console.error('Error enabling 2FA:', error);
}

    // const isOTPValid = enteredOTP === generatedOTP; // Compare the entered OTP with the generated OTP

    // if(isOTPValid){
    //   console.log("otp is valid!");
    // }else{
    //   console.log("otp is invalid!");
    // }

  };

  return (
    <div>
      <h1>Google Authenticator</h1>
      <button onClick={handleSendOtp}>Enable Multifactor</button>
      <div id="recaptcha-container" />
      <label>Verification OTP:</label>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOTP(e.target.value)}
      />
      <button onClick={handleVerify}>Verify</button>
    </div>
  );
};

export default MfaVerification;
