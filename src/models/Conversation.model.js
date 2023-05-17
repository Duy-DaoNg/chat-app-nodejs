import mongoose from "mongoose"
import { Schema, ObjectId } from "mongoose"

export default mongoose.model('Conversation',
    new Schema(
        {
            id: {
                type: ObjectId,
            },
            members: {
                type: Array
            },
            name: {
                type: String,
            },
            sender: {
                type: String,
            },
            lastMessage: {
                messageType: {type: String},
                messageContent: {type: String}
            }
        },
        { timestamps: true }
    )
)