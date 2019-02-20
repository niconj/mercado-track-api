import { Document } from 'mongoose';

export interface ISnapshot extends Document {
  original_price: number;
  price: number;
  discount: number;
  date: Date;
}
