import multer from 'multer'
import admin from 'firebase-admin'
import {v4 as uuidv4} from 'uuid'
import initialPath from '../helpers/public.path.js'
import path from 'path'
import fs from "fs"

// Initialize Multer middleware
const storage = multer.memoryStorage()
const upload = multer({storage: storage})
// Initialize Firebase Admin SDK
var serviceAccountKey = JSON.parse(fs.readFileSync(path.join(initialPath, '/../serviceAccountKey.json')).toString())

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    storageBucket: 'chat-app-4eb0b.appspot.com'
})
const bucket = admin.storage().bucket()
// Handle file upload
const handleFileUpload = upload.single('image')
const uploadFile = async (req, res, next) => {
    try {
        const file = req.file
        // Generate a unique name using UUID
        const uuid = uuidv4()
        const fileName = `${uuid}-${file.originalname}`
        // Upload file to Firebase Storage
        const fileUpload = bucket.file(fileName)
        const stream = fileUpload.createWriteStream()
        stream.on('error', err => {
            res.status(500).send('Failed to upload file to Firebase Storage.')

        })
        stream.on('finish', async () => {
            try {
                //Get public download URL for the uploaded file
                const [url] = await fileUpload.getSignedUrl({action: 'read', expires:'1-1-9999'})
                req.fileMessage = {
                    conversationId: req.body.conversationId,
                    sender: req.body.sender,
                    text: "",
                    messageType: "image",
                    fileURL: url
                }
                next()
            } catch (error) {
                res.status(500).send('Failed to save image link to MongoDB')
            }

        })
        stream.end(file.buffer)
    } catch (error) {
        res.status(500).send('Failed to upload image')
    }
}

 export {
    handleFileUpload,
    uploadFile
 }
