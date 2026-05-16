const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const BloodStock = require('../models/BloodStock');

// GET all donors (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { bloodGroup, city, available } = req.query;
    const filter = {};

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = new RegExp(city, 'i');
    if (available === 'true') filter.isAvailable = true;

    const donors = await Donor.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: donors.length, data: donors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single donor
router.get('/:id', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });
    res.json({ success: true, data: donor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST register new donor
router.post('/', async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();

    // Update blood stock
    await BloodStock.findOneAndUpdate(
      { bloodGroup: donor.bloodGroup },
      { $inc: { unitsAvailable: 1 }, $set: { lastUpdated: new Date() } },
      { upsert: true }
    );

    res.status(201).json({ success: true, message: 'Donor registered successfully!', data: donor });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update donor
router.put('/:id', async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });
    res.json({ success: true, message: 'Donor updated successfully', data: donor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE donor
router.delete('/:id', async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });

    // Update stock
    await BloodStock.findOneAndUpdate(
      { bloodGroup: donor.bloodGroup },
      { $inc: { unitsAvailable: -1 }, $set: { lastUpdated: new Date() } }
    );

    res.json({ success: true, message: 'Donor removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH mark donation
router.patch('/:id/donate', async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      {
        $set: { lastDonated: new Date(), isAvailable: false },
        $inc: { totalDonations: 1 }
      },
      { new: true }
    );
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });
    res.json({ success: true, message: 'Donation recorded!', data: donor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
