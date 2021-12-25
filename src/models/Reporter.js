const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const News = require('./News');

const reporterSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate(value) {
      if(!validator.isEmail(value)) throw new Error('Please provide a valid email address');
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 6,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate(num) {
      if (!validator.isMobilePhone(num, ['ar-EG'])) throw new Error ('Please add your valid Egyptian phone number');
    }
  },
  age: {
    type: Number,
    trim: true,
    validate(value) {
      if (value < 0) throw new Error ('How that comes! Please add your true age');
      if (value < 30) throw new Error ('Your age is less than 30! You can\'t work as a reporter');
    }
  },
  tokens: [
    {token: {
      type: String,
      required: true,
    }}
  ],
  avatar: {
    type: Buffer,
  }
});

reporterSchema.virtual('repos', {
  ref: 'News',
  localField: '_id',
  foreignField: 'owner'
})

// Hashing Password
reporterSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

reporterSchema.pre('remove', async function (next) {
  const reporter = this;

  await News.deleteMany({owner: reporter._id})

  next();
})

// Generate Token
reporterSchema.methods.generateToken = async function () {
  const reporter = this;

  const token = jwt.sign({_id: reporter._id.toString()}, process.env.JWT_SECRET)
  reporter.tokens = reporter.tokens.concat({token});
  await reporter.save();
  return token;
};

// Log in
reporterSchema.statics.findByEmailAndPass = async (email, pass) => {
  const thrownMsg = `Please Check email or password`;
  const reporter = await Reporter.findOne({email});
  if (!reporter) throw new Error (thrownMsg);

  const isPassMatch = await bcrypt.compare(pass, reporter.password);
  if (!isPassMatch) throw new Error (thrownMsg);

  return reporter;
}

// Delete passwords and tokens on Send
reporterSchema.methods.getPublicData = function () {
  const reporter = this;
  const reporterObj = reporter.toObject();

  delete reporterObj.password;
  delete reporterObj.tokens;

  return reporterObj;
}

const Reporter = mongoose.model('Reporter', reporterSchema);

module.exports = Reporter;