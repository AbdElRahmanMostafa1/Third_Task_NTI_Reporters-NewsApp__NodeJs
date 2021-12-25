const express = require("express");
const multer  = require('multer');

const lock = require("../middleware/lock");
const router = express.Router();

const Reporter = require("../models/Reporter");

// Sign Up => Create
router.post("/reporters", async (req, res) => {
  try {
    const reporter = new Reporter(req.body);
    const token = await reporter.generateToken();
    await reporter.save();
    res.status(200).send({ reporter, token });
  } catch (error) {
    res.status(501).send(error.message);
  }
});

// Log in
router.post("/reporters/login", async (req, res) => {
  try {
    const reporter = await Reporter.findByEmailAndPass(
      req.body.email,
      req.body.password
    );
    const token = await reporter.generateToken();
    res.status(200).send({ reporter: reporter.getPublicData(), token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get Reporter Profile => Read
router.get("/reporters/me", lock, async (req, res) => {
  try {
    // console.log('req.user');
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update User info
router.patch("/reporters/me", lock, async (req, res) => {
  const allowedUpdates = ["name", "phone", "email", "password"];
  const updates = Object.keys(req.body);

  const isValid = updates.every((update) => allowedUpdates.includes(update));
  if (!isValid) return res.status(400).send(`Update isn't available!`);

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Upload user image
const upload = multer({
  limits: {
    fileSize: 1024*1024,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(gif|jpe?g|tiff?|png|webp|bmp|jfif)$/)) {
      return cb ('Please upload an image');
    };
    cb(undefined, true);
  }
});

router.post('/reporters/me/avatar', lock, upload.single('avatar'), async (req, res) => {
  try {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.status(200).send('Image Uploaded Successfully!');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete('/reporters/me/avatar', lock, upload.single('avatar'), async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send(`Image Deleted Successfully!`);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete user Account
router.delete("/reporters/me", lock, async (req, res) => {
  try {
    await req.user.remove();
    
    res.status(200).send(`Reporter deleted successfully!`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Logout 1 device
router.delete('/reporters/logout', lock, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.status(200).send('Logged Out successfully!')
  } catch (error) {
    res.status(500).send(error.message)
  }
});

// Logout all
router.delete('/reporters/logoutall', lock, async (req, res) => {
  req.user.tokens = [];
  await req.user.save();
  res.status(200).send('logged Out from all devices')
});

module.exports = router;
