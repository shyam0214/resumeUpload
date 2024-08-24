const express = require("express");
const router = express.Router();
const multer = require("multer");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Application = require("../models/Application");
const jwt = require("jsonwebtoken");

// Setup multer for file uploads
const upload = multer({ dest: "uploads/" });

// Register User
router.post("/signup", async (req, res) => {
  const { email, password,name } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const user = new User({ email, password ,name});
    await user.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user.", error: error.toString() });
  }
});

const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"];
  
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }
  
    try {
        console.log(token)
      const decoded = jwt.verify(token, "applogin");

      req.user = decoded;
      next();
    } catch (error) {
      res.status(400).json({ message: "Invalid token." });
    }
  };


router.get("/applications", authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.userId }); // Assuming applications are tied to a user
    res.status(200).json(applications);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving applications.",
        error: error.toString(),
      });
  }
});


// Get Application by ID

router.get("/applications/:id", authenticateToken, async (req, res) => {
  const applicationId = req.params.id;

  try {
    const application = await Application.findOne({
      _id: applicationId,
      userId: req.user.userId,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.status(200).json(application);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving application.",
        error: error.toString(),
      });
  }
});




router.post("/signup", async (req, res) => {
  const { email,name, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({status:false, message: "Email already in use." });
    }

    const user = new User({ email, password ,name});
    await user.save();

    res.status(201).json({status:true, message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ status:false,message: "Error registering user.", error });
  }
});


// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({status:false , message: "User not found." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({status:false , message: "Invalid credentials." });
    }

    // Create and sign a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      "applogin",
      {
        expiresIn: "1h", // Token expiration time
      }
    );

    res.status(200).json({ status:true,message: "Login successful!", token });
  } catch (error) {
    res
      .status(500)
      .json({status:false, message: "Error logging in.", error: error.toString() });
  }
});

// Send Email and Save Application
router.post(
  "/send-email",
  authenticateToken,
  upload.single("attachment"),
  async (req, res) => {
    const { email, companyName, requirements } = req.body;
    const attachment = req.file;

    try {
      if (!attachment) {
        return res
          .status(400)
          .json({ message: "Resume attachment is required." });
      }

    //   const application = new Application({
    //     email,
    //     companyName,
    //     dateApplied: new Date(),
    //     requirements,
    //     resume: attachment.path,
    //   });

    //   await application.save();

      let obj = {
        email: email,
        attachment: attachment,
      };

      await MailSender(obj, res);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Failed to submit application.",
          error: error.toString(),
        });
    }
  }
);

const MailSender = async (obj, res) => {
  try {
    // Construct the email details with HTML and inline CSS
    const emailDetails = {
      recipient: obj.email,
      subject: "Application for Node.js Developer Position",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <p>Dear Sir/Mam,</p>
            <p>I hope this email finds you well.</p>
            <p>I am writing to express my interest in the <strong>Node.js Developer position</strong> as advertised. With <strong>2 years of experience</strong> in backend development, particularly with Node.js, Express.js, and MongoDB,  I believe  I have the skills and expertise that align with the requirements of this role.</p>
            <p>At <strong>Hamilton Web Service</strong>, I have optimized backend microservices, improved data storage and retrieval processes, and implemented seamless migration strategies. My previous role at Explore Wonders allowed me to develop and maintain web applications, demonstrating my ability to handle complex projects effectively. Additionally, my internship at FunctionUp provided me with a solid foundation in backend development principles and database management.</p>
            <p>I am particularly interested in joining because of your commitment to innovative solutions and the opportunity to work on challenging projects with a talented team. I am confident that my skills and experience make me a strong candidate for this role, and I am eager to contribute to the success of your team.</p>
            <p>Please find my resume attached for your review. I am available for an interview at your earliest convenience and can be reached at <a href="tel:+916388173284">6388173284</a> or via email at <a href="mailto:shyamgupta00555@gmail.com">shyamgupta00555@gmail.com</a>.</p>
            <p>Thank you for considering my application. I look forward to the opportunity to discuss how my background, skills, and enthusiasms can be in line with the goals of your company.</p>
            <p style="margin-top: 20px;">Best Regards,</p>
            <p><strong>Shyam Gupta</strong><br>Node JS Developer<br>Mobile: <a href="tel:+916388173284">(+91) 6388173284</a></p>
        </div>
      `,
    };

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "shyamgupta00555@gmail.com", // replace with your email
        pass: "scvu lrna qwzg ddhl", // replace with your email password
      },
    });

    // Setup email data
    const mailOptions = {
      from: "shyamgupta00555@gmail.com", // sender address
      to: emailDetails.recipient, // list of receivers
      subject: emailDetails.subject, // Subject line
      html: emailDetails.html, // HTML body with inline CSS
      attachments: [
        {
          filename: obj.attachment.originalname,
          path: obj.attachment.path, // path to the uploaded file
        },
      ],
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: error.toString() });
      }
      res.status(200).json({ message: "Email sent successfully!", info });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send email.", error: error.toString() });
  }
};

module.exports = router;
