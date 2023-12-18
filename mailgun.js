const express = require('express');
const nodemailer = require('nodemailer');
const cors = require("cors");
const dotenv = require('dotenv');
const mg = require('mailgun-js');

const corsOptions = {
    origin: ["http://localhost:19006","https://dev-app-goulvenfrs.vercel.app","https://dev-app-nu.vercel.app","https://app.fillgood.io","https://fillgood.io","https://mg.fillgood.io","https://mail.mg.fillgood.io","https://mail.fillgood.io"],
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

app.get('/', (req, res) => {
  res.send('MailGun server')
})

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
          let err =JSON.stringify(error)
          res.status(500).send({ message: "Error in sending email : "+{err} });
        } else {
          console.log(body);
          res.send({ message: 'Email sent successfully' });
        }
      }
    );
});

app.post('/send-email', async (req, res) => {
  try {
    // Paramètres pour la connexion SMTP avec Mailgun
    const transporter = nodemailer.createTransport({
      service: 'Mailgun',
      host: 'smtp.mailgun.org',
      port: 587,
      auth: {
        user: 'postmaster@mg.fillgood.io', // Remplacez par votre nom d'utilisateur SMTP Mailgun
        pass: '40dd24c5d3ea8dba8da3c649e639f356-07f37fca-28979945', // Remplacez par votre mot de passe SMTP Mailgun
      },
    });

    // Récupérer les informations de l'email depuis la requête
    const { email, subject, message } = req.body;

    // Options de l'email
    const mailOptions = {
      from: 'postmaster@mg.fillgood.io', // Remplacez par votre adresse email d'expéditeur
      email,
      subject,
      message,
    };

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent: ', info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email: ', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const port = (process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});