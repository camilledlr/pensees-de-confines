const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const multer = require("multer");

// giving access to your cloudinary account
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// uploading the file to yopurt cloudinary account
const storage = cloudinaryStorage({
  cloudinary,
  folder: "P2C",
  ressource_type : 'auto',
  allowedFormats: ['jpg', 'png', 'mp4', 'mov', 'gif'],
  filename: function (req, file, cb) {
    cb(null, file.originalname); }
  //     ressource_type: "raw"
  // }

});

const fileUploader = multer({ storage });
module.exports = fileUploader;
