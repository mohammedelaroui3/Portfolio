import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite errors when the function is reused warm across invocations
export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);