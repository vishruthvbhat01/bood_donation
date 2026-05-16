const express = require('express');
const router = express.Router();
const BloodStock = require('../models/BloodStock');

// GET all stock
router.get('/', async (req, res) => {
  try {
    // Initialize stock if needed
    await BloodStock.initializeStock();
    const stock = await BloodStock.find().sort({ bloodGroup: 1 });
    res.json({ success: true, data: stock });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET stock for specific blood group
router.get('/:bloodGroup', async (req, res) => {
  try {
    const stock = await BloodStock.findOne({ bloodGroup: req.params.bloodGroup });
    if (!stock) return res.status(404).json({ success: false, message: 'Blood group not found' });
    res.json({ success: true, data: stock });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update stock manually (admin)
router.put('/:bloodGroup', async (req, res) => {
  try {
    const { unitsAvailable } = req.body;
    const stock = await BloodStock.findOneAndUpdate(
      { bloodGroup: req.params.bloodGroup },
      { unitsAvailable, lastUpdated: new Date() },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, message: 'Stock updated', data: stock });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
