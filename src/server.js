import express from "express"
import * as dotenv from 'dotenv'
dotenv.config()
import cookieParser from "cookie-parser"
import handlebars from "express-handlebars"
import initialPath from "./helpers/public.path.js"
import path from 'path'
import http from 'http'
import {Server} from "socket.io"
import chatRoute from './routes/chat.route.js'
import userRoute from './routes/user.route.js'
import loginRoute from './routes/login.route.js'
import SocketServices from './services/chat.service.js'
import authenticator from "./controllers/authentication.js"
const app = express()
const port = 3000
const server = http.createServer(app)
const io = new Server(server)
import connect from './database/database.js'
import { resolveSoa } from "dns"
// global variable
global.__publicDir = initialPath
global._io = io
//middleware to handle form data
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
app.use(express.json())
// set static path to get resource
app.use(express.static(initialPath))
//template engine
app.engine('hbs', handlebars.engine({
    extname: '.hbs'
}))
app.set('view engine', "hbs");

app.set('views', path.join(initialPath, '../resources/views'))
// route
app.use('/', loginRoute)
app.use(authenticator)
app.use('/chat', chatRoute)
app.use('/user', userRoute)

global._io.on('connection', SocketServices.connection.bind(SocketServices))



server.listen(port, async () => {
    await connect()
    console.log('Listening at port: ', port)
})



