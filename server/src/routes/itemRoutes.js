const express = require('express');
const Item = require('../models/Item');
const { itemSchema } = require('../utils/validators');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router.use(authMiddleware);

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    console.log("Files received:", req.files);

    const payload = itemSchema.parse(req.body);

    // ✅ Correct way: multer-storage-cloudinary returns `file.path` or `file.url`
    const imageUrls = req.files?.map(f => f.path || f.url) || [];

    const item = await Item.create({
      ...payload,
      images: imageUrls,
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userPhone: req.user.phone,
      college: req.user.college,
      campus: payload.campus || req.user.campus,
    });

    console.log("Item created successfully:", item);
    res.status(201).json(item);

  } catch (error) {
    console.error('Create item error', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0]?.message });
    }
    res.status(500).json({ message: 'Failed to create item' });
  }
});

module.exports = router;
