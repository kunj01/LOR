import { ApiError } from "../utils/ApiError.js";
import prisma from "../utils/prismClient.js";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json(
          new ApiError(401, "Session expired. Please login again!", [
            "Unauthorized",
          ])
        );
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findFirst({
      where: {
        id: decodedToken.userId,
      },
    });
    if (!user) {
      return res
      .status(401)
      .json(new ApiError(401, "User not authenticated", ["Unauthorized"]));
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", err));
  }
};

export default isAuthenticated;
