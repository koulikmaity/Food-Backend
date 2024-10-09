import { Request, Response, NextFunction } from "express";
import { FindVandor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utility";
import { EditVandorInput, VandorLoginInput } from "../dto";
import { Food } from "../models";
import { CreateFoodInputs } from "../dto/Food.dto";
import { Order } from "../models/Order";




export const VandorLogin =  async (req: Request, res: Response, next: NextFunction) => {
    
    const {email, password} = <VandorLoginInput>req.body;

    const exitingVandor = await FindVandor('', email);

    if(exitingVandor !== null){

        const validation = await ValidatePassword(password, exitingVandor.password, exitingVandor.salt);
        if(validation){

            const signature = await GenerateSignature({
                _id:  exitingVandor.id,
                email: exitingVandor.email,
                name: exitingVandor.name,
                foodTypes: exitingVandor.foodType
            })
            return res.json(signature);
        }
        else {
            return res.json("Password is not valid");
        }

    }
    
    return res.json("Login credential is not valid");

}



export const GetVandorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if(user){
        const exitingVandor = await FindVandor(user._id);
        
        return res.json(exitingVandor);
    }

    return res.json("Vandor information is not found")

}




export const UpdateVandorProfile = async (req: Request,res: Response, next: NextFunction) => {
    
    const user = req.user;

    const { foodTypes, name, address, phone } = <EditVandorInput>req.body;
     
    if(user){

       const existingVandor = await FindVandor(user._id);

       if(existingVandor !== null){

            existingVandor.name = name;
            existingVandor.address = address;
            existingVandor.phone = phone;
            existingVandor.foodType = foodTypes;
            const saveResult = await existingVandor.save();

            return res.json(saveResult);
       }

    }
    return res.json({'message': 'Unable to Update vendor profile '})

}



export const UpdateVendorCoverImage = async (req: Request,res: Response, next: NextFunction) => {

    const user = req.user;

     if(user){

       const vendor = await FindVandor(user._id);

       if(vendor !== null){

            const files = req.files as [Express.Multer.File];

            const images = files.map((file: Express.Multer.File) => file.filename);

            vendor.coverImages.push(...images);

            const saveResult = await vendor.save();
            
            return res.json(saveResult);
       }

    }
    return res.json({'message': 'Unable to Update vendor profile '})

}







export const UpdateVandorService = async (req: Request,res: Response, next: NextFunction) => {

    const user = req.user;

    if(user){
        const existingVendor = await FindVandor(user._id);

        if(existingVendor !== null){
            existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
            const saveResult = await existingVendor.save()
            return res.json(saveResult);
        }

        return res.json(existingVendor);
    }
    
    return res.json({'message': 'Unable to Update vendor profile '})

}





export const AddFood = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if(user){
        
        const  { name, description, category, foodType, readyTime, price } = <CreateFoodInputs>req.body

        const vendor = await FindVandor(user._id);
        if(vendor !== null){
            const files = req.files as [Express.Multer.File];

            const images = files.map((file: Express.Multer.File) => file.filename);

            const createdFood = await Food.create({
                vendorId: vendor._id,
                name: name,
                description: description,
                category: category,
                foodType: foodType,
                readyTime: readyTime,
                price: price,
                rating: 0,
                images: images
            })

            vendor.foods.push(createdFood);
            const saveResult = await vendor.save();

            return res.json(saveResult);

        }

    }

}



export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if(user){
        const foods = await Food.find({vandorId: user._id});

        if(foods !== null){
            return res.json(foods);
        }

        return res.json("Food information is not found");
    }

}






export const GetCurrentOrders = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    // console.log(user);
    
    if(user){
        // console.log(user._id);
        const orders = await Order.find({ vendorId: user._id}).populate('items.food')
        // console.log(orders);
        if(orders !== null){
            return res.status(200).json(orders);
        }
    }

    return res.json({ message: 'Orders Not found'});
}

export const GetOrderDetails = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;
    
    if(orderId){

        const order = await Order.findById(orderId).populate('items.food');

        if(order !== null){
            return res.status(200).json(order);
        }
    }

    return res.json({ message: 'Order Not found'});
}

export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;

    const { status, remarks, time } = req.body;

    
    if(orderId){

        const order = await Order.findById(orderId).populate('items.food');

        if(order){
            order.orderStatus = status;
            order.remarks = remarks
            if(time){
                order.readyTime = time;
            }

            const orderResult = await order.save();

            if(orderResult !== null){
                return res.status(200).json(orderResult);
            } else {
                return res.status(500).json({ message: 'Failed to update order' });
            }
        }
        else{
            return res.status(404).json({ message: 'Order not found' });
        }
    }

    return res.json({ message: 'Unable to process order'});    
} 