const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    unique: true
  },
  unitsAvailable: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Static method to initialize stock for all blood groups
stockSchema.statics.initializeStock = async function () {
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  for (const bg of bloodGroups) {
    await this.findOneAndUpdate(
      { bloodGroup: bg },
      { $setOnInsert: { bloodGroup: bg, unitsAvailable: 0 } },
      { upsert: true, new: true }
    );
  }
};

module.exports = mongoose.model('BloodStock', stockSchema);
