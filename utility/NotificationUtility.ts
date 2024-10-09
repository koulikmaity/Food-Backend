/* ------------------- Email --------------------- */

/* ------------------- Notification --------------------- */

/* ------------------- OTP --------------------- */

export const GenerateOtp = () => {

    const otp = Math.floor(10000 + Math.random() * 900000);
    let expiry = new Date();
    expiry.setTime(new Date().getTime() + (30*60*1000))

    return {otp, expiry};

}



export const onRequestOtp = async ( otp: number, toPhoneNumber: string ) => {

    try {
        const accountSid = process.env.accountSid;
        const authToken = process.env.authToken

        const client = require('twilio')(accountSid, authToken);

        const response = await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.phoneNumber,
            to: `+91${toPhoneNumber}` // recipient phone number // Add country before the number
        })
        return response;
    } catch (error) {
        return console.log("error", error)
    }

}



/* ------------------- Payment --------------------- */