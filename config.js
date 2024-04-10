const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter
  .verify()
  .then(() => {
    console.log("Ready for send emails");
  })
  .catch((err) => {
    console.log({ Error: err });
  });



module.exports = {
  transporter,
};
