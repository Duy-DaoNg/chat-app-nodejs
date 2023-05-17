
import ConversationModel from "../models/Conversation.model.js"
import MessageModel from "../models/Message.model.js"
import UserModel from "../models/User.model.js";

const chatpage = async (req, res, next) => {
    res.render('chat')
}
const message = async (req, res) => {
    const newMessage = new MessageModel(req.body)
    const conversationId = req.body.conversationId
    const senderId = req.body.sender
    const text = {
        messageType: 'text',
        messageContent: req.body.text
    }
    try {
        const savedMessage = await newMessage.save()
        await updateConversationLastMessage(text, conversationId, senderId)
        res.status(200).json(newMessage)
    } catch(error) {
        res.status(500).json(error)
    }
}
const fileMessage = async (req, res) => {
    const fileMessage = req.fileMessage
    const newMessage = new MessageModel(fileMessage)
    const conversationId = fileMessage.conversationId
    const senderId = fileMessage.sender
    const lastMessageContent = {
        messageType: 'image',
        messageContent: fileMessage.fileURL
    }
    try {
        const savedMessage = await newMessage.save()
        await updateConversationLastMessage(lastMessageContent, conversationId, senderId)
        res.status(200).json({fileURL:fileMessage.fileURL})
    } catch(error) {
        res.status(500).json(error)
    }
}
const getAllMessage = async (req, res, next) => {
    const pageSize = 20
    const pageNum = parseInt(req.query.pageNumber) || 1
    const author = res.locals.author
    const conversationId = req.params.conversationId
    try {
        const authorizationResult = await ConversationModel.findOne({
            _id: conversationId,
            members: {$elemMatch: {userId: author.authorId}}
        })
        if (!authorizationResult) {
            return res.status(500).json({ error: "Invalid Conversation" });
        }
        const messages = await MessageModel.find({conversationId:conversationId})
        .sort({ createdAt: -1 }) // Sort by descending order of creation time
        .skip((pageSize * pageNum) - pageSize) // Calculate the number of documents to skip
        .limit(pageSize) // Limit the number of documents to retrieve
        .exec()
        const count = await MessageModel.countDocuments({conversationId:conversationId})
        const pageCount = Math.ceil(count / pageSize);
        res.status(200).json({
            messages: messages,
            currentPage: pageNum,
            pageCount: pageCount
        });
    } catch(error) {
        res.status(500).json(error) 
    }
}
const validUserId = async (userId) => {
    try {
        const result = await UserModel.find({_id:userId})
        if(result) {
            return 1
        } else {
            return 0
        }
    } catch (error) {
        return 0
    }
}
const conversation = async (req, res, next) => {
    var validRequest = await validUserId(req.body.receiver.id)
    validRequest = validRequest && await validUserId(req.body.sender.id)
    if (validRequest) {
        const members = {
            members: [
                {
                    userId: req.body.sender.id,
                    username: req.body.sender.name
                },
                {
                    userId: req.body.receiver.id,
                    username: req.body.receiver.name
                }
            ]
        }
        const existConversation = await ConversationModel.find(members)
        if (existConversation.length) {
            res.status(500).json({message: "Conversation existed"})
        } else {
            const newConversation = new ConversationModel(members)
            try {
                const savedConversation = await newConversation.save()
                res.status(200).json(savedConversation)
            } catch(error){
                res.status(500).json(error)
            }
        }
    } else {
        res.status(500).json({message: 'invalid request'})
    }
}
const updateConversationLastMessage = async (message, conversationId, senderId) => {
    const query = {_id: conversationId}
    const newValue = {$set: { lastMessage: message, sender: senderId}}
    try {
        const result = await ConversationModel.updateOne(query, newValue)
    } catch(error) {
        throw new Error(error)
    }
}
const getAllConversation = async (req, res, next) => {
    try {
        const conversation = await ConversationModel.find({
             "members": { $elemMatch: { userId:req.params.userId } } 
            })
        res.status(200).json(conversation)
    } catch(error){
        res.status(500).json(error)
    }
}

export {
    chatpage,
    message,
    conversation,
    getAllConversation,
    getAllMessage,
    fileMessage
}