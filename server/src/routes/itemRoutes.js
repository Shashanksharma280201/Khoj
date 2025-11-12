const express = require('express');
const Item = require('../models/Item');
const { itemSchema } = require('../utils/validators');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router.use(authMiddleware);

// Debug line (optional)
router.post('/test', upload.array('images', 5), (req, res) => {
  console.log("Files received:", req.files);
  res.json({ received: req.files });
});

router.get('/', async (req, res) => {
  try {
    const { type, category, status, campus, search } = req.query;
    const filters = { college: req.user.college };
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (campus) filters.campus = campus;
    if (search) {
      const regex = new RegExp(search, 'i');
      filters.$or = [
        { title: regex },
        { description: regex },
        { location: regex },
        { category: regex },
      ];
    }
    const items = await Item.find(filters).sort({ createdAt: -1 }).limit(200);
    res.json(items);
  } catch (error) {
    console.error('Get items error', error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
});

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    console.log("Files received:", req.files);
    const payload = itemSchema.parse(req.body);
    const imageUrls = req.files ? req.files.map(f => f.path) : [];

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
