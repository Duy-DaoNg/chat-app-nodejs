import express from 'express'
import { getUsername, getUserInforByEmail } from '../controllers/user.controller.js'
const route = express.Router()

route.get(':userId', getUsername) 
route.get('/:email', getUserInforByEmail) 

export default route