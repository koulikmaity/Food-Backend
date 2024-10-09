import express, { Request, Response, NextFunction } from 'express';

import { Authenticate } from '../middlewares';
import { AddToCart, CreateOrder, CustomerLogin, CustomerSignUp, CustomerVerify, DeleteCart, EditCustomerProfile, GetCart, GetCustomerProfile, GetOrderById, GetOrders, RequestOtp } from '../controllers';

// import { Offer } from '../models/Offer';

const router = express.Router();

/* ------------------- Suignup / Create Customer --------------------- */
router.post('/signup', CustomerSignUp)

/* ------------------- Login --------------------- */
router.post('/login', CustomerLogin)


/* ------------------- Verify Customer Account --------------------- */
router.patch('/verify', Authenticate, CustomerVerify)


/* ------------------- OTP / request OTP --------------------- */
router.get('/otp', Authenticate,  RequestOtp)

/* ------------------- Profile --------------------- */
router.get('/profile', Authenticate, GetCustomerProfile)
router.patch('/profile', Authenticate, EditCustomerProfile)

//Cart
router.post('/cart', Authenticate, AddToCart)
router.get('/cart', Authenticate, GetCart)
router.delete('/cart', Authenticate, DeleteCart)


// //Apply Offers
// router.get('/offer/verify/:id', VerifyOffer);


// //Payment
// router.post('/create-payment', CreatePayment);


//Order
router.post('/create-order', Authenticate, CreateOrder);
router.get('/orders', Authenticate, GetOrders);
router.get('/order/:id', Authenticate, GetOrderById)

export { router as CustomerRoute}