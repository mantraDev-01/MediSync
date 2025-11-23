import emailjs from "@emailjs/browser";

export async function sendEmailAlert({ to, subject, message }) {
  try {
    const response = await emailjs.send(
      "service_vrywf56",     // replace
      "template_ubsozr5",    // replace
      {
        to_email: to,
        subject,
        message,
      },
      {
        publicKey: "s_ywFHu4eW1EU1o6J", // replace
      }
    );

    console.log("Email sent:", response);
    return true;
  } catch (error) {
    console.log("Email error:", error);
    return false;
  }
}
