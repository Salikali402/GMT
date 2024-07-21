const mongoose= require('mongoose')

const sharedSchema = new mongoose.Schema({
  speed: Number,
  createdAt: { type: Date, default: Date.now }
});
const Shared = mongoose.model('Shared', sharedSchema);

module.exports= Shared