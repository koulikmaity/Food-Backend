import express from 'express'
import App from './services/ExpressApp'
import dbConnection from './services/Database'
import { PORT } from './config';

// import { AdminRoute, VandorRoute } from './routes'
// import { MONGO_URI } from './config';


// const app = express();
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use('/images', express.static(path.join(__dirname, 'images')))


// mongoose.connect(MONGO_URI, {
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true,
//     // useCreateIndex: true
// })
// .then(result => {
//     console.log('DB connected')
// }).catch(error => {
//     console.log('errr'+ error)
// })

const StartServer = async () => {

    const app = express();

    await dbConnection();

    await App(app);

    app.listen(PORT, () => {
        console.clear()
        console.log(`Listening to port ${PORT}`);
    })

}

StartServer();

