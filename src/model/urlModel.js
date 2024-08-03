import mongoose from './index.js';

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  title: { type: String ,index: false },
  date:{type:Date,required:true},
  email: { type: String,required: true}
});

const Url = mongoose.model('Url', urlSchema);

export default Url