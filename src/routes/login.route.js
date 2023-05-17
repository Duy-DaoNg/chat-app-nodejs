import express from 'express'
import { loginPage, login, register, logout} from '../controllers/login.controller.js'
const route = express.Router()


route.post('/register', register)
route.post('/login', login)
route.get('/logout', logout)
route.get('/', loginPage)

export default route