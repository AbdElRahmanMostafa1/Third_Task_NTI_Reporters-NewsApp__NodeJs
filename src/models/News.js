const mongoose = require('mongoose');

const newsSchema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    createdAt: Date,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Reporter'
  }
}, {
  timestamps: true,
});

const News = mongoose.model('News', newsSchema);

module.exports = News;