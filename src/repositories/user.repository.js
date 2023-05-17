import  UserModel  from "../models/User.model.js"
import bcrypt from 'bcrypt'
import jwt, {verify} from "jsonwebtoken"
const login = async ({email, password}) => {
    try {
        const existingUser = await UserModel.findOne({email}).exec()
        if(existingUser) {
            const comparePass = await bcrypt.compare(password, existingUser.password)
            if (comparePass) {
                //create JWT 
                const token = jwt.sign({ data: existingUser }, process.env.JWT_SECRET);
                return {
                    token: token,
                    userId: existingUser._id.toHexString(),
                    username: existingUser.username
                }
            }
            throw new Error('Error when login')
        }
        //encrypt password
    } catch(error) {
        throw new Error('Error when login')
    }
}
const register = async ({
    username,
    password,
    phoneNumber,
    email,
    gender
}) => {
    try {
        console.log('email: ', email)
        console.log('name: ', username)
        console.log('password: ', password)
        const existingUser = await UserModel.findOne({email}).exec()
        if(existingUser) {
            throw new Error('User already exist')
        }
        //encrypt password
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS))
        const newUser = await UserModel.create({
            username, email, 
            password: hashedPassword,
            phoneNumber,
            gender
        })
        return {
            ...newUser._doc,
            password: 'Not show'
        }
    } catch(error) {
        console.log(error)
        //check model validation here
        throw new Error('Cannot register user')
    }
}
export default{
    login,
    register
}