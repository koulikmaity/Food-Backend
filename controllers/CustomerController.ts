import express, { Request, Response, NextFunction } from 'express'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator' 

import { GeneratePassword, GenerateSalt, GenerateSignature, onRequestOtp, ValidatePassword } from '../utility'
import { GenerateOtp } from '../utility'
import { CartItem, CreateCustomerInput, EditCustomerProfileInput, OrderInputs, UserLoginInput } from '../dto'
import { Customer, DeliveryUser, Food, Vandor } from '../models'
import { Order } from '../models/Order'
import { Transaction } from '../models/Transaction'




export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {

    const customerInput = plainToClass(CreateCustomerInput, req.body)
    const inputErrors = await validate(customerInput, { validationError: {target: true } })

    if(inputErrors.length > 0){
        return res.status(400).json(inputErrors)
    }

    const { email, phone, password } = customerInput;


    const salt = await GenerateSalt()
    const userPasword = await GeneratePassword(password, salt);


    const {otp, expiry} = GenerateOtp();

    const existingCustomer = await Customer.findOne({ email: email })

    if(existingCustomer !== null){
        return res.status(409).json({message: 'An user ia already exist with this Email'})
    }
    

    const result = await Customer.create({

        email: email,
        password: userPasword,
        salt: salt,
        firstName: '',
        lastName: '',
        address: '',
        phone: phone,
        verified: false,
        otp: otp,
        otp_expiry: expiry,
        lat: 0,
        lng: 0,
        orders: []

    })


    if(result){
        
        // send otp to the customer
        await onRequestOtp(otp, phone);


        // generate the signature
        const signature = await GenerateSignature({
            _id: result.id,
            email: result.email,
            verified: result.verified,
        })
        

        // send the result to the client
        return res.status(201).json({signature: signature, verified: result.verified, email: result.email})

    }

    return res.status(400).json({ msg: 'Error while creating user'});


}



export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {

    const customerInput = plainToClass(UserLoginInput, req.body);

    const validationError = await validate(customerInput, {validationError: { target: true}})

    if(validationError.length > 0){
        return res.status(400).json(validationError);
    }

    const { email, password } = customerInput;

    const customer = await Customer.findOne({email: email});
    if(customer){
        const validation = await ValidatePassword(password, customer.password, customer.salt);

        if(validation){
            const signature = await GenerateSignature({
                _id: customer.id,
                email: customer.email,
                verified: customer.verified,
            })
            return res.status(200).json({ signature: signature, email: customer.email, verified: customer.verified });
        }
    }
    return res.json({ msg: 'Error With Login'});

}



export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {

    const { otp } = req.body;
    const customer = req.user;

    if(customer){
        const profile = await Customer.findById(customer._id);
        if(profile){
            if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()){
                profile.verified = true;

                const updatedCustomerResponse = await profile.save();

                const signature = await GenerateSignature({
                    _id: updatedCustomerResponse.id,
                    email: updatedCustomerResponse.email,
                    verified: updatedCustomerResponse.verified
                })

                return res.status(200).json({ signature: signature, email: updatedCustomerResponse.email, verified: updatedCustomerResponse.verified })
            }
            
        }

    }

    return res.status(400).json({ msg: 'Error with OTP validation'});

}




export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    if(customer){

        const profile = await Customer.findById(customer._id);

        if(profile){
            const { otp, expiry } = GenerateOtp();
            profile.otp = otp;
            profile.otp_expiry = expiry;

            await profile.save();
            const sendCode = await onRequestOtp(otp, profile.phone);

            if (!sendCode) {
                return res.status(400).json({ message: 'Failed to verify your phone number' })
            }

            return res.status(200).json({ message: 'OTP sent to your registered Mobile Number!'})

        }
    }

    return res.status(400).json({ msg: 'Error with Requesting OTP'});
   
}



export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;
 
    if(customer){
        
        const profile =  await Customer.findById(customer._id);
        
        if(profile){
             
            return res.status(201).json(profile);
        }

    }
    return res.status(400).json({ msg: 'Error while Fetching Profile'});

}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    const customerInputs = plainToClass(EditCustomerProfileInput, req.body);

    const validationError = await validate(customerInputs, {validationError: { target: true}})

    if(validationError.length > 0){
        return res.status(400).json(validationError);
    }

    const { firstName, lastName, address } = customerInputs;

    if(customer){
        
        const profile =  await Customer.findById(customer._id);
        
        if(profile){
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            const result = await profile.save()
            
            return res.status(201).json(result);
        }

    }
    return res.status(400).json({ msg: 'Error while Updating Profile'});


}






/* ------------------- Delivery Notification --------------------- */

const assignOrderForDelivery = async(orderId: string, vendorId: string) => {

    // find the vendor
    // const vendor = await Vandor.findById(vendorId);
    // if(vendor){
    //     const areaCode = vendor.pincode;
    //     const vendorLat = vendor.lat;
    //     const vendorLng = vendor.lng;

    //     //find the available Delivery person
    //     const deliveryPerson = await DeliveryUser.find({ pincode: areaCode, verified: true, isAvailable: true});
    //     if(deliveryPerson){
    //         // Check the nearest delivery person and assign the order

    //         const currentOrder = await Order.findById(orderId);
    //         if(currentOrder){
    //             //update Delivery ID
    //             currentOrder.deliveryId = deliveryPerson[0]._id as string; 
    //             await currentOrder.save();

    //             //Notify to vendor for received new order firebase push notification
    //         }

    //     }


    // }




    // Update Delivery ID

}





















/* ------------------- Cart Section --------------------- */

export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;
    
    if(customer){

        const profile = await Customer.findById(customer._id).populate('cart.food');
        let cartItems = Array();

        const { _id, unit } = <CartItem>req.body;

        const food = await Food.findById(_id);

        if(food){

            if(profile != null){
                cartItems = profile.cart;

                if(cartItems.length > 0){
                    // check and update
                    let existFoodItems = cartItems.filter((item) => item.food._id.toString() === _id);
                    if(existFoodItems.length > 0){
                        
                        const index = cartItems.indexOf(existFoodItems[0]);
                        
                        if(unit > 0){
                            cartItems[index] = { food, unit };
                        }else{
                            cartItems.splice(index, 1);
                        }

                    }else{
                        cartItems.push({ food, unit})
                    }

                }else{
                    // add new Item
                    cartItems.push({ food, unit });
                }

                if(cartItems){
                    profile.cart = cartItems as any;
                    const cartResult = await profile.save();
                    return res.status(200).json(cartResult.cart);
                }

            }
        }

    }

    return res.status(404).json({ msg: 'Unable to add to cart!'});
}

export const GetCart = async (req: Request, res: Response, next: NextFunction) => {

      
    const customer = req.user;
    
    if(customer){
        const profile = await Customer.findById(customer._id).populate('cart.food');

        if(profile){
            return res.status(200).json(profile.cart);
        }
    
    }

    return res.status(400).json({message: 'Cart is Empty!'})

}

export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {

   
    const customer = req.user;

    if(customer){

        const profile = await Customer.findById(customer._id).populate('cart.food').exec();

        if(profile != null){
            profile.cart = [] as any;
            const cartResult = await profile.save();

            return res.status(200).json(cartResult);
        }

    }

    return res.status(400).json({message: 'cart is Already Empty!'})

}









/* ------------------- Order Section --------------------- */





const validateTransaction = async(txnId: string) => {
    
    const currentTransaction = await Transaction.findById(txnId);

    if(currentTransaction){
        if(currentTransaction.status.toLowerCase() !== 'failed'){
            return {status: true, currentTransaction};
        }
    }
    return {status: false, currentTransaction};
}





export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {


    // grab current login customer
    const customer = req.user;
    
    if(customer){

        // Create an Order ID
        const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

        const profile = await Customer.findById(customer._id);

        if(profile){

            // Grab order items from request [{ id: XX, unit: XX }]
       
        const cart = <[OrderInputs]>req.body;  // [{ id: XX, unit: XX }]


        let cartItems = Array();

        let netAmount = 0.0

        let vendorId;

        // Calculate order amount
        const foods = await Food.find().where('_id').in(cart.map(item => item._id)).exec();
        // console.log('Foods array:', foods);


        if(foods.length > 0 && cart.length > 0) {
        foods.map(food => {
            cart.map(({ _id, unit }) => {
                if(food._id == _id){
                    vendorId = food.vendorId;
                    netAmount += (food.price * unit);
                    cartItems.push({ food: food._id, unit });
                }
                })
            })
        }
        else{
            console.log('Either foods or cart array is empty');
        }


        // Create Order with item description
        if(cartItems){
            const currentOrder = await Order.create({
                orderID: orderId,
                vendorId: vendorId,
                items: cartItems,
                totalAmount: netAmount,
                orderDate: new Date(),
                paidThrough: 'COD',
                paymentResponse: '',
                orderStatus: 'Waiting',
                remarks: '',
                deliveryId: '',
                appliedOffers: false,
                offerId: null,
                readyTime: 45
            })

            
            if(currentOrder ) {
                profile.cart = [] as any;
                profile.orders.push(currentOrder);
                const profileResponse = await profile.save();
                // await profile.save()
                return res.status(200).json(profileResponse);
            }
        }

        }

        


    }

    return res.status(400).json({ msg: 'Error while Creating Order'});
}

export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;
    
    if(customer){

 
        const profile = await Customer.findById(customer._id).populate("orders");
        if(profile){
            return res.status(200).json(profile.orders);
        }

    }

    return res.status(400).json({ msg: 'Orders not found'});
}


export const GetOrderById = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;
    
    
    if(orderId){
 
        const order = await Order.findById(orderId).populate("items.food");
        
        if(order){
            return res.status(200).json(order);
        }

    }

    return res.status(400).json({ msg: 'Order not found'}); 
}






