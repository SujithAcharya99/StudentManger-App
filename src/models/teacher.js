const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email id....!');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if (value.toLowerCase().includes('password')) {
                throw new Error('password cannot contain "password"');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be greater than zero');
            }
        }
    },
    roll:{
        type: String,
        default: 'not assigned'
    },
    subjects_taught: {
        type: String,
        required: true,
        trim: true
    },tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

teacherSchema.methods.generateAuToken = async function () {
    const teacher = this;
    const token = jwt.sign({ _id: teacher._id.toString() }, 'thisismynewcourse')
    teacher.tokens = teacher.tokens.concat({ token });
    await teacher.save();
    return token;
}

teacherSchema.statics.findByCredentials = async (email, password) => {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
        throw new Error('Unable to Login');
    }
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
        throw new Error('Unable is login');
    }
    return teacher;
};

teacherSchema.pre('save',async function (next) {
    const teacher = this;
    if (teacher.isModified('password')) {
        teacher.password = await bcrypt.hash(teacher.password, 8);
    }
    next();
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
