import mongoose, {Schema, ObjectId} from 'mongoose'
import isEmail from 'validator/lib/isemail.js'
export default mongoose.model('User',
    new Schema({
        id: {type: ObjectId},
        username: {
            type: String,
            required: true,
            validate: {
                validator: (value) => value.length > 5,
                message: "Username must be at least 5 characters"
            }
        },
        email: {
            type: String,
            required: true,
            validate: {
                validator: (value) => isEmail,
                message: "Email invalid"
            }
        },
        friend: {
            type: [String]
        },
        password: {
            type: String,
            required: true
            // validate
        },
        phoneNumber: {
            type: String,
            validate: {
                validator: (phoneNumber) => phoneNumber.length > 8,
                message: 'Phone number must be at least 5 characters'
            }
        },
        gender: {
            type: String,
            enum: {
                values: ['Male', 'Female'],
                message: '{VALUE} is not supported'
            }
        }
    })
)