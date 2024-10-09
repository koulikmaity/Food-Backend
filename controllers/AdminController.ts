import { Request, Response, NextFunction } from 'express'
import { CreateVandorInput } from '../dto';
import { Vandor } from '../models';
import { GeneratePassword, GenerateSalt } from '../utility';



export const FindVandor = async (id: string | undefined, email?: string) => {
    

    if(email){
        return await Vandor.findOne({email: email});
    }
    else {
        return await Vandor.findById(id);
    }

}




export const CreateVandor = async (req: Request, res: Response, next: NextFunction) => {

    const { name, address, pincode, foodType, email, password, ownerName, phone } = <CreateVandorInput>req.body

    const exitingVandor = await FindVandor('', email);

    if(exitingVandor !== null){
        return res.json("Vandor is alredy listed using this email Id");
    }
    


    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);


    const createdVandor =  await Vandor.create({
        name: name,
        address: address,
        pincode: pincode,
        foodType: foodType,
        email: email,
        password: userPassword,
        salt: salt,
        ownerName: ownerName,
        phone: phone,
        rating: 0,
        serviceAvailable: false,
        coverImages: [],
        foods: [],
        lat: 0,
        lng: 0,
    })



    return res.json(createdVandor)


}



export const GetVandors = async (req: Request, res: Response, next: NextFunction) => {

    const vandors = await Vandor.find();

    if(vandors === null){
        return res.json("No Vandor is listed");
    }

    return res.json(vandors);

}




export const GetVandorByID = async (req: Request, res: Response, next: NextFunction) => {

    const vandorId = req.params.id;

    try {
        const vandor = await Vandor.findById(vandorId);
        if(vandor) {
            return res.json(vandor);
        } else {
            return res.status(404).json({"message": "Vandor not found"});
        }
    } catch (error) {
        return res.status(500).json({"message": "Internal Server Error"});
    }
}