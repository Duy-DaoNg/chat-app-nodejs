import jwt, { verify } from "jsonwebtoken";
import UserModel from "../models/User.model.js";

const authenticator = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    var authenticationResult = jwt.verify(token, process.env.JWT_SECRET);
    if (authenticationResult) {
      const validUserResult = await UserModel.findOne({_id:authenticationResult.data._id})
      if (validUserResult) {
          res.locals.author = {
            authorId:authenticationResult.data._id,
            authorName:authenticationResult.data.username
          }
        next();
      } else {
        res.clearCookie('token')
        res.redirect("/")
      }
    }
  } catch {
    res.redirect("/");
  }
};

export default authenticator;
