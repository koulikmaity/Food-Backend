import dotenv from 'dotenv'
dotenv.config();

export const MONGO_URI = process.env.MONGO_URI
console.log(MONGO_URI)

export const APP_SECRET = "OUR_APP_SECRET"

export const PORT = process.env.PORT ||  8000