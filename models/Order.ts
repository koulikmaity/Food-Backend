import mongoose, { Schema, Document, Model } from 'mongoose';


export interface OrderDoc extends Document {

    orderID: string;
    vendorId: string;
    items: [any];
    totalAmount: number;
    // paidAmount: number;
    orderDate: Date;
    paidThrough: string;
    orderStatus: string;
    remarks: string;
    paymentResponse: string,
    deliveryId: string;
    readyTime: number;
    appliedOffers: boolean;
    offerId: string
}


const OrderSchema = new Schema({
    orderID: {type: String, required: true},
    vendorId: {type: String, require: true},
    items: [
        {
            food: { type: Schema.Types.ObjectId, ref: "food", required: true},
            unit: { type: Number, required: true}
        }
    ],
    totalAmount: {type: Number, required: true},
    // paidAmount: {type: Number, require: true},
    orderDate: {type: Date },
    paidThrough: { type: String },  // COD, Credit card, Debit Card
    orderStatus: {type: String},
    remarks: {type: String },
    paymentResponse: { type: String },
    deliveryId: {type: String},
    readyTime:{type: Number},
    appliedOffers: {type: Boolean},
    offerId: {type: String}
     
},{
    toJSON: {
        transform(doc, ret){
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;

        }
    },
    timestamps: true
});


const Order = mongoose.model<OrderDoc>('order', OrderSchema);

export { Order }