import {userRepository} from "../repositories/index.js"

const loginPage = async (req, res) => {
    res.render('login')
}
const login = async (req, res) => {
    try {
        const {email, password} = req.body
        const {token, userId, username} = await userRepository.login({email, password})
        if (token) {
            //Cookie expires in 8 hours
            res.cookie('token', token, { expires: new Date(Date.now() + 28800000) });
            res.cookie('userId', userId, { expires: new Date(Date.now() + 28800000) });
            res.cookie('username', username, { expires: new Date(Date.now() + 28800000) });
            res.status(200).json('Login Successfully')
        } else {
            res.status(401).json('Unauthorized');
        }
    } catch(error) {
        res.status(500).json({error: error})
    }
}
const register = async (req, res) => {
    const {username, email, password, phoneNumber, gender} = req.body
    try {
        const user = await userRepository.register({
            username, email, password, phoneNumber, gender
        })
        console.log('Register succles')
        res.status(200).json({
            message: 'register user successfully',
            data: user
        })
    } catch(error) {
        res.status(400).json({
            error: error
        })
    }
}
const logout = async (req, res) => {
    // clear all cookie then redirect to login page
    res.clearCookie('token');
    res.clearCookie('username');
    res.clearCookie('userId');
    res.redirect('/')
}
export {
    loginPage,
    login,
    register,
    logout
}