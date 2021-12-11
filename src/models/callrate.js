import mongoose from 'mongoose';
import PaginationPlugin from '../helpers/pagination';

const CallRateSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  code: {
    type: String,
  },
  zone: {
    type: Number,
  },
  rate: {
    type: Number,
    required: true,
  },
});

CallRateSchema.plugin(PaginationPlugin);

export default mongoose.model('CallRate', CallRateSchema);
