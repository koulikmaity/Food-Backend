import express from 'express'
import { AddFood, GetCurrentOrders, GetFoods, GetOrderDetails, GetOrders, GetVandorProfile, ProcessOrder, UpdateVandorProfile, UpdateVandorService, UpdateVendorCoverImage, VandorLogin } from '../controllers';
import { Authenticate } from '../middlewares';
import multer from 'multer';

const router = express.Router();




const imageStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString()+'_'+file.originalname)   // filename keep unique
    }
})


const images = multer({storage:  imageStorage}).array('images', 10);




router.post('/login', VandorLogin);

router.get('/profile', Authenticate, GetVandorProfile);
router.patch('/profile', Authenticate, UpdateVandorProfile);
router.patch('/coverimage', Authenticate, images, UpdateVendorCoverImage);
router.patch('/service', Authenticate, UpdateVandorService);


router.post('/food', Authenticate, images, AddFood);
router.get('/foods', Authenticate, GetFoods)


// Orders
router.get('/orders', Authenticate, GetCurrentOrders);
router.put('/order/:id/process', Authenticate, ProcessOrder);
router.get('/order/:id', Authenticate, GetOrderDetails)






//Offers
// router.get('/offers', GetOffers);
// router.post('/offer', AddOffer);
// router.put('/offer/:id', EditOffer)


router.get('/vandor', (req, res) => {
    res.json("Message from vandor");
})



export { router as VandorRoute }