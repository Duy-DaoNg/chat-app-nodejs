class SocketServices {
    // connection socket
    constructor() {
        this.users = []
    }
    connection(socket){
        
        const addUser = (userId, socketId) => {
            !this.users.some(user => user.userId === userId) &&
                this.users.push({userId, socketId})
        }
        const removeUser = (socketId) => {
            this.users = this.users.filter(user=>user.socketId !== socketId)
        }
        const getUser = (userId) => {
            return this.users.find(user=>user.userId === userId)
        }

        socket.on('addUser', (userId) => {
            addUser(userId, socket.id)
            
        })
        // emit message
        socket.on('sendMessage', ({senderId, senderName, receiverId, text, conversationId}) => {
            const receiver = getUser(receiverId)
            if (receiver) {
                _io.to(receiver.socketId).emit("receive message", {
                    senderId,
                    senderName,
                    text,
                    conversationId
                })
            }

        })
        socket.on('send image', ({senderId, senderName, receiverId, fileURL, conversationId}) => {
            const receiver = getUser(receiverId)
            if (receiver) {
                _io.to(receiver.socketId).emit("receive image", {
                    senderId,
                    senderName,
                    fileURL,
                    conversationId
                })
            }
        })
        socket.on('send setConversationStatus', ({receiverId, conversationId}) => {
            const receiver = getUser(receiverId)
            if (receiver) {
                _io.to(receiver.socketId).emit("receive setConversationStatus", {conversationId})
                _io.to(socket.id).emit("receive setConversationStatus", {conversationId})
            } else {
                _io.to(socket.id).emit("resetConversationStatus", {conversationId})
            }
        })
        socket.on('send loadContactSignal', ({receiverId}) => {
            const receiver = getUser(receiverId)
            if (receiver) {
                _io.to(receiver.socketId).emit('receive loadContactSignal', {message: 'load your contact'})
            }
        })
        // user disconnected
        socket.on('disconnect', () => {
            removeUser(socket.id)
        });
    }
}

export default new SocketServices()
