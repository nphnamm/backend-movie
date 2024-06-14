import express from "express";
import {
  loginUser,
  registerUser,
  updateUserProfile,
  deleteUserProfile,
  changeUserPassword,
  getLikedMovies,
  addLikedMovies,
  deleteLikedMovies,
  getUsers,
  deleteUser,
  addToLikedMovies,
  deleteLikedMoviesById
} from "../Controllers/UserController.js";
import { protect, admin } from "../Middlewares/Auth.js";
const router = express.Router();

// ********* PUBLIC ROUTES ************
router.post("/", registerUser);
router.post("/login", loginUser);

// ********* PRIVATES ROUTES ************

router.put("/", protect, updateUserProfile);
router.delete("/", protect, deleteUserProfile);
router.put("/password", protect, changeUserPassword);
router.get("/favorities", protect, getLikedMovies);
router.post("/favorities", protect, addLikedMovies);
router.delete("/favorities", protect, deleteLikedMovies);
router.post("/add", addToLikedMovies);
router.delete("/favoritesMovie/:movieId",protect, deleteLikedMoviesById);


// ********* ADMIN ROUTES ************

router.get("/", protect, admin, getUsers);
router.delete("/:id", protect, admin, deleteUser);

export default router;
