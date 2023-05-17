import {userRepository} from "../repositories/index.js"
import UserModel from "../models/User.model.js"


const getUserInforByEmail = async (req, res, next) => {
    try {
        const regex = new RegExp(req.params.email, 'i');
        const result = await UserModel.find({email: { $regex: regex }}).limit(5).exec()
        const returnData = []
        result.forEach(element => {
            returnData.push({_id:element._id, username:element.username})
        })
        res.status(200).json({data: returnData})
    } catch (err) {
        res.status(500).json({message: 'Not Found'})
    }
}
const getUsername= async (req, res, next) => {
    try {
        const {userId} = req.body
        const {username} = await userRepository.getUsername({userId})
        if(username) {
            res.status(200).json({
                username: user
            })
        }
    } catch(error) {
        res.status(500).json(error)
    }
}


export {
    getUsername,
    getUserInforByEmail
}