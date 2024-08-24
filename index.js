const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const cors = require("cors");
const router = require("./router/route");
const mongoose = require('mongoose');
const app = express();
const port = 5000;

const upload = multer();
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(cors());
app.use('/', router);

// Connect to MongoDB
mongoose.connect('mongodb+srv://shyamgupta:VLoc5ZGLfiKRJrJX@cluster0.dbdyccj.mongodb.net/nodejs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
