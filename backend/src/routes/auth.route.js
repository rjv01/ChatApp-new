import express from "express";
const router = express.Router();
import { protectRoute } from "../middleware/auth.middleware.js";

import { 
    signup,
    login,
    logout,
    loggedin,
    updateProfile,
    } from "../controllers/auth.controller.js";

router.post('/signup',signup);
router.post('/login',login);
router.post('/logout',logout);
router.get('/check',protectRoute,loggedin);

router.put('/update-profile',protectRoute,updateProfile);



export default router;