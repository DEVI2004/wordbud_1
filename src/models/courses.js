const mongoose = require('mongoose');

// Define the schema for the Course model
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // Add more fields as needed
});

// Create the Course model based on the schema
const Course = mongoose.model('Course', courseSchema);

// Export the Course model
module.exports = Course;
