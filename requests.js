const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const BloodStock = require('../models/BloodStock');

// GET all requests
router.get('/', async (req, res) => {
  try {
    const { status, urgency, bloodGroup } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    const requests = await BloodRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single request
router.get('/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create request
router.post('/', async (req, res) => {
  try {
    const request = new BloodRequest(req.body);
    await request.save();
    res.status(201).json({ success: true, message: 'Blood request submitted!', data: request });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH update request status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const oldStatus = request.status;
    request.status = status;
    await request.save();

    // If fulfilled, reduce stock
    if (status === 'Fulfilled' && oldStatus !== 'Fulfilled') {
      await BloodStock.findOneAndUpdate(
        { bloodGroup: request.bloodGroup },
        { $inc: { unitsAvailable: -request.unitsRequired }, $set: { lastUpdated: new Date() } }
      );
    }

    res.json({ success: true, message: `Request marked as ${status}`, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE request
router.delete('/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
