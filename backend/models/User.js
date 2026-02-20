const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  age: {
    type: Number,
    default: 30,
    min: 1,
    max: 120
  },
  healthConditions: [{
    type: String,
    enum: [
      'asthma',
      'allergies',
      'heart_disease',
      'respiratory_issues',
      'diabetes',
      'hypertension',
      'none'
    ]
  }],
  smokingStatus: {
    type: String,
    enum: ['smoker', 'non-smoker', 'ex-smoker'],
    default: 'non-smoker'
  },
}, {
  timestamps: true
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
