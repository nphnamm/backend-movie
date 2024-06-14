import asyncHandler from "express-async-handler";
import User from "../Models/UserModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../Middlewares/Auth.js";

// @desc Register user
// @route POST /api/users/
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, images } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user in DB;
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      images,
    });
    // if user created succeedfully send user data and token to client

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        images: user.images,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

// @desc Login user
// @route POST  /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    //find user in DB
    const user = await User.findOne({ email });
    // if usser exits compare password with hashed password then send user data and token to client
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        images: user.images,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
      //if user not found or password not match send error message
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ************** PRIVATE CONTROLLERS ***********

//@desc Update user profile
//@route PUT /api/users/profile
//@access Private

const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, email, images, isAdmin } = req.body;
  console.log("check is admin ", isAdmin);
  try {
    // find user in DB
    const user = await User.findById(req.user._id);
    //if user exits update user data and save it in DB

    if (user) {
      user.fullName = fullName || user.fullName;
      user.email = email || user.email;
      user.images = images || user.images;
      user.isAdmin = isAdmin;
      const updatedUser = await user.save();

      //send updated user data and token to client

      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        images: updatedUser.images,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      });
    }
    //else send error message
    else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// const deleteUserProfile = asyncHandler(async)

// @desc Delete user profile
// @route DELETE /api/users
// @access Private

const deleteUserProfile = asyncHandler(async (req, res) => {
  try {
    //find user in DB
    const user = await User.findById(req.user._id);

    if (user) {
      // if user is admin throw error message
      if (user.isAdmin) {
        res.status(400);
        throw new Error("Can't delete admin user");
      }
      //else delete user from db
      await user.remove();
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(400);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc Delete user profile
const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    //find user in DB
    const user = await User.findById(req.user._id);

    // if user exits compare old password with hashed password then update user password and save it in DB

    if (user && (await bcrypt.compare(oldPassword, user.password))) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      console.log("check password hash: ", hashedPassword);
      user.password = hashedPassword;
      await user.save();
      res.json({ message: "Password change!" });
    } else {
      res.status(401).json({ message: "Invalid email or password!" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error);
  }
});

// @desc Get all liked movies
// @route POST /api/users/favorites
// @access Private
const getLikedMovies = asyncHandler(async (req, res) => {
  try {
    //find user in DB
    const user = await User.findById(req.user._id).populate("likedMovies");

    // if user exits send liked movies to client
    if (user) {
      res.json(user.likedMovies);
    } else {
      res.status(400);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc Add movie liked movies
// @route POST /api/users/favorites
// @access Private
const addLikedMovies = asyncHandler(async (req, res) => {
  const { movieId } = req.body;

  try {
    //find user in DB
    const user = await User.findById(req.user._id);

    // if user exits add movie to liked movies and save it in DB
    if (user) {
      // //check if movie already liked
      // const isMovieLiked = user.likedMovies.find((movie) => movie.toString()=== movieId);

      //if movie already liked send error message

      if (user.likedMovies.includes(movieId)) {
        res.status(400).json("Movie already liked");
        throw new Error("Movie already liked");
      }

      // else and movie to liked movies and save it in DB
      user.likedMovies.push(movieId);
      await user.save();

      res.status(201).json({ message: "Add movie successfully" });
    } else {
      res.status(400).json({ message: "User Not Found!" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// @desc Delete all liked movies
// @route DELETE /api/users/favorites
// @access Private
const deleteLikedMovies = asyncHandler(async (req, res) => {
  try {
    //find user in DB
    const user = await User.findById(req.user._id);

    // if user exits send liked movies to client
    if (user) {
      user.likedMovies = [];
      await user.save();
      res.json({ message: "All liked movies deleted successfully" });
    } else {
      res.status(400);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ************** ADMIN CONTROLLERS ***********

// @desc Get all user
// @route DELETE /api/users
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  try {
    //find user in DB
    const users = await User.find({});

    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  try {
    //find user in DB
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.isAdmin) {
        res.status(400);
        throw new Error("can't delete admin user");
      }
      await user.remove();
      res.json({ message: "User deleted successfully" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const addToLikedMovies = async (req, res) => {
  try {
    const { email, data } = req.body;
    const user = await await User.findOne({ email });
    if (user) {
      const { likedMovies } = user;
      const movieAlreadyLiked = likedMovies.find(({ id }) => id === data.id);
      if (!movieAlreadyLiked) {
        await User.findByIdAndUpdate(
          user._id,
          {
            likedMovies: [...user.likedMovies, data],
          },
          { new: true }
        );
      } else return res.json({ msg: "Movie already added to the liked list." });
    } else await User.create({ email, likedMovies: [data] });
    return res.json({ msg: "Movie successfully added to liked list." });
  } catch (error) {
    return res.json({ msg: "Error adding movie to the liked list" });
  }
};
const deleteLikedMoviesById = async (req, res) => {
 const  movieId = req.params.movieId;

 try {
   //find user in DB
   const user = await User.findById(req.user._id);

   // if user exits add movie to liked movies and save it in DB
   if (user) {
     // //check if movie already liked
      const isMovieLiked = user.likedMovies.filter((movie) => movie.toString() !== movieId);

     //if movie already liked send error message

     if (user.likedMovies.includes(movieId)) {
       user.likedMovies = [...isMovieLiked];
       await user.save();
     return res.status(201).json({ message: "delete movie successfully"});
     }




   } else {
     res.status(400).json({ message: "User Not Found!" });
   }
 } catch (error) {
   res.status(400).json({ message: error });
 }
};
export {
  registerUser,
  loginUser,
  updateUserProfile,
  deleteUserProfile,
  changeUserPassword,
  getLikedMovies,
  addLikedMovies,
  deleteLikedMovies,
  getUsers,
  deleteUser,
  addToLikedMovies,
  deleteLikedMoviesById,
};
