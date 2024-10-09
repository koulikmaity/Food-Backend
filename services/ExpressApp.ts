import express, { Application } from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import { AdminRoute, CustomerRoute, ShoppingRoute, VandorRoute } from '../routes'





export default async (app: Application) => {

    // const app = express();
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use('/images', express.static(path.join(__dirname, '../images')))


    app.use('/admin', AdminRoute );
    app.use('/vandor', VandorRoute );
    app.use('/customer', CustomerRoute)
    app.use(ShoppingRoute)

    return app;
}




// const app = express();
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use('/images', express.static(path.join(__dirname, 'images')))





// app.use('/admin', AdminRoute );
// app.use('/vandor', VandorRoute );