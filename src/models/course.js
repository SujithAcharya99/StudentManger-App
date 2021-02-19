const mongoose = require('mongoose');
const validator = require('validator')
const Course = mongoose.model('Course', {
    studentName: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    teacherName: {
        type: String,
        required: true,
        trim: true
    }
});
module.exports = Course;
