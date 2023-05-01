import express from "express"
import handlebars from "express-handlebars"
import initialPath from "./helpers/initialPath.js"
import path from 'path'
const app = express()
const port = 3000

app.use(express.static(path.join(initialPath, '/public')))
//template engine
app.engine('hbs', handlebars.engine({
    extname: '.hbs'
}))
app.set('view engine', "hbs");
app.set('views', path.join(initialPath, 'resources/views'))
app.get('/', (req, res) => {
    res.render('home')
})

app.listen(port, () => {
    console.log('Listening at port: ', port)
})



