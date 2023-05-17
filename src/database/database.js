import mongoose from 'mongoose'
mongoose.set('strictQuery', true)
const connect = async () => {
    try {
        let connection = await mongoose.connect(process.env.MONGO_URI)
        console.log('Connect to MongoDB successfully')
    } catch (error) {
        const {code} = error
        if (error.code == 8000) {
            throw new Error ("Wrong database's username or password")
        } else if (code == "ENOTFOUND"){
            throw new Error("Wrong server name/connection string")
        }
        throw new Error('Cannot connect to MongoDB')
    }
}
export default connect