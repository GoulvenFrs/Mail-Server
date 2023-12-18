const express = require('express');
const cors = require("cors");
const dotenv = require('dotenv');
const mg = require('mailgun-js');

const corsOptions = {
    origin: ["http://localhost:19006","https://dev-app-goulvenfrs.vercel.app","https://dev-app-nu.vercel.app","https://app.fillgood.io","https://fillgood.io"],
  };

dotenv.config();

const mailgun = () =>
  mg({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMIAN,
  });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.post('/api/email', (req, res) => {
  const { email, subject, message } = req.body;
  mailgun()
    .messages()
    .send(
      {
        from: 'Fillgood <postmaster@mg.fillgood.io>',
        to: `${email}`,
        subject: `${subject}`,
        html: `<p>${message}</p>`,
      },
      (error, body) => {
        if (error) {
          console.log(error);
          res.status(500).send({ message: 'Error in sending email' });
        } else {
          console.log(body);
          res.send({ message: 'Email sent successfully' });
        }
      }
    );
});

const port = (process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});