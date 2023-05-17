
import mongoose from "mongoose"
import { Schema, ObjectId } from "mongoose"

export default mongoose.model('Message',
    new Schema(
        {
            conversationId: {
                type: String,
            },
            sender: {
                type: String,
            },
            text: {
                type: String,
            },
            messageType: {
                type: String,
            },
            fileURL: {
                type: String,
            }
        },
        { timestamps: true }
    )
)