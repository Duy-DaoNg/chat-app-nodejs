import express from 'express'
import srcPath from '../helpers/public.path.js'
import { chatpage, message, conversation, getAllConversation, getAllMessage, fileMessage } from '../controllers/chat.controller.js'
import { handleFileUpload, uploadFile } from '../controllers/file.controller.js'
const route = express.Router()


route.get('/', chatpage)
route.post('/message', message)
route.get('/message/:conversationId', getAllMessage)
route.post('/conversation', conversation)
route.get('/conversation/:userId', getAllConversation)
route.post('/upload/image', handleFileUpload, uploadFile, fileMessage)

export default route