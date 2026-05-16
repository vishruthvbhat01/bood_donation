/**
 * seed.js — Run this once to populate sample data
 * Usage: node seed.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Donor = require('./models/Donor');
const BloodRequest = require('./models/BloodRequest');
const BloodStock = require('./models/BloodStock');

const donors = [
  { name: 'Ramesh Kumar', age: 28, bloodGroup: 'O+', phone: '9876543210', email: 'ramesh@example.com', city: 'Chennai', isAvailable: true },
  { name: 'Priya Sharma', age: 35, bloodGroup: 'A+', phone: '9876543211', email: 'priya@example.com', city: 'Bangalore', isAvailable: true, totalDonations: 3 },
  { name: 'Karthik Raj', age: 22, bloodGroup: 'B+', phone: '9876543212', email: 'karthik@example.com', city: 'Mumbai', isAvailable: true },
  { name: 'Aisha Mohammed', age: 30, bloodGroup: 'AB+', phone: '9876543213', email: 'aisha@example.com', city: 'Hyderabad', isAvailable: true, totalDonations: 1 },
  { name: 'Suresh Babu', age: 45, bloodGroup: 'O-', phone: '9876543214', email: 'suresh@example.com', city: 'Chennai', isAvailable: false, totalDonations: 7 },
  { name: 'Deepa Nair', age: 27, bloodGroup: 'A-', phone: '9876543215', email: 'deepa@example.com', city: 'Kochi', isAvailable: true },
  { name: 'Vikram Singh', age: 33, bloodGroup: 'B-', phone: '9876543216', email: 'vikram@example.com', city: 'Delhi', isAvailable: true, totalDonations: 2 },
  { name: 'Lakshmi Devi', age: 29, bloodGroup: 'AB-', phone: '9876543217', email: 'lakshmi@example.com', city: 'Bangalore', isAvailable: true }
];

const requests = [
  { patientName: 'Anbu Raj', bloodGroup: 'O+', unitsRequired: 2, hospital: 'Apollo Hospital, Chennai', contactNumber: '9123456780', urgency: 'Critical', status: 'Pending' },
  { patientName: 'Selvi Kumar', bloodGroup: 'A+', unitsRequired: 1, hospital: 'Fortis Hospital, Bangalore', contactNumber: '9123456781', urgency: 'Urgent', status: 'Pending' },
  { patientName: 'Muthu Vel', bloodGroup: 'B+', unitsRequired: 3, hospital: 'AIIMS, Mumbai', contactNumber: '9123456782', urgency: 'Normal', status: 'Fulfilled' }
];

const stock = [
  { bloodGroup: 'A+', unitsAvailable: 15 },
  { bloodGroup: 'A-', unitsAvailable: 4 },
  { bloodGroup: 'B+', unitsAvailable: 12 },
  { bloodGroup: 'B-', unitsAvailable: 2 },
  { bloodGroup: 'AB+', unitsAvailable: 8 },
  { bloodGroup: 'AB-', unitsAvailable: 1 },
  { bloodGroup: 'O+', unitsAvailable: 18 },
  { bloodGroup: 'O-', unitsAvailable: 3 }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blooddonation');
  console.log('Connected to MongoDB');

  await Donor.deleteMany({});
  await BloodRequest.deleteMany({});
  await BloodStock.deleteMany({});

  await Donor.insertMany(donors);
  await BloodRequest.insertMany(requests);
  await BloodStock.insertMany(stock);

  console.log('✅ Sample data inserted successfully!');
  console.log(`  - ${donors.length} donors`);
  console.log(`  - ${requests.length} blood requests`);
  console.log(`  - ${stock.length} blood stock entries`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
