import mongoose from 'mongoose';

// Attrs to provide when building a payment
interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

// List of props a payment has
interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
  // version: number; // Not neccesary, we only create payment once and no update ever will be done
}

// List of properties the payment model itself contains
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  stripeId: {
    type: String,
    required: true,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id
      delete ret._id;
    }
  }
});

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs)
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema)

export { Payment }