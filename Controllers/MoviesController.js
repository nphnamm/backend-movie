import Movies from "../Models/MovieModel.js";
import { MoviesData } from "../Data/movie-app.movies.js";
import asyncHandler from "express-async-handler";

// ********** PUBLIC CONTROLLERS **************
// @desc import movies
// @route GET /api/movies/import
// Access Level: Public

const importMovies = asyncHandler(async (req, res) => {
  //frist we make sure our Movies table is empty by delete all documents
  try {
    await Movies.deleteMany({}); //
    // then we insert all movies from MoviesData

    const movies = await Movies.insertMany(MoviesData);
    return res.status(201).json(movies);
  } catch (error) {
    console.log(error);
  }
});

// @desc get all movies
// @route Get /api/movies
// @access public
const getMovies = asyncHandler(async (req, res) => {
  try {
    //filter movies by category, time, language, rate, year and search
    const { category, time, language, rate, year, search } = req.query;
    let query = {
      ...(category && { category }),
      ...(time && { time }),
      ...(language && { language }),
      ...(rate && { rate }),
      ...(year && { year }),
      ...(search && { name: { $regex: search, $options: "i" } }),
    };
    console.log("check query", query);
    //load more movies functionality
    const page = Number(req.query.pageNumber) || 1; //if pageNumber is not provided in query we set it to 1
    const limit = 12; //2 movies per page
    const skip = (page - 1) * limit; // skip 2 movie per page
    // find movies by query , skip and limit
    const movies = await Movies.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // get total number of movies
    const count = await Movies.countDocuments(query);

    //send response with movies and total number of movies
    res.json({
      movies,
      page,
      pages: Math.ceil(count / limit), // total number of pages
      totalMovies: count,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//@desc     Get single movie by id
//@route    GET/api/movies/:id
//access    Public

const getMovieById = asyncHandler(async (req, res) => {
  try {
    // find movie by id in database
    const movie = await Movies.findById(req.params.id);
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json("Movie Not Found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//@desc     Get top rated movies
//@route    GET/api/movies/rated/top
//@access    Public

const getTopRatedMovies = asyncHandler(async (req, res) => {
  try {
    //find top rated movies
    const movies = await Movies.find({}).sort({ rate: -1 });
    res.json(movies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//  @desc   Get ranndom movies
//  @route  GET /api/movies/random/all
//  @access public

const getRadomMovies = asyncHandler(async (req, res) => {
  try {
    // find random movies
    const movies = await Movies.aggregate([{ $sample: { size: 8 } }]);
    //send random movies to the client

    res.json(movies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ********* PRIVATE CONTROLLERS *********
//@desc     Create a movie review
//@route    POST /api/movies/:id/reviews
//@access   Private

const createMovieReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const movie = await Movies.findById(req.params.id);

    if (movie) {
      //check if the user already reviewed this movie
      const alreadyReviewed = movie.reviews.find(
        (r) => r.userId.toString() === req.user._id.toString()
      );
      //if the user already reviewed this movie send 400 error
      if (alreadyReviewed) {
        res.status(400).json("You already reviewed this movie");
        throw new Error("You already reviewed this movie");
      }
      //else create a new review
      const review = {
        userName: req.user.fullName,
        userId: req.user._id,
        userImage: req.user.images,
        rating: Number(rating),
        comment,
      };
      //push the new review to the reviews array
      movie.reviews.push(review);

      //increment the number of reviews
      movie.numberOfReviews = movie.reviews.length;

      //calculate the new rate
      movie.rate =
        movie.reviews.reduce((acc, item) => acc + item.rating, 0) /
        movie.reviews.length;

      //save the movie in database
      await movie.save();
      //send the new movie to the client
      res.status(201).json({
        message: "Review added",
      });
    } else {
      res.status(404);
      throw new Error("Movie not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
const deleteMovieReview = asyncHandler(async (req, res) => {
  try {
    const movie = await Movies.findById(req.params.id);
    const { id } = req.body;
    if (!movie) {
      res.status(404);
    }
    // const alreadyReviewed = movie.reviews.find(
    //   (r) => r.userId.toString() === req.user._id.toString()
    // );
    movie.reviews.remove({ _id: id });
    res.status(200).json({ data: "Deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ********* ADMIN CONTROLLERS *********
//@desc     Update movie
//@route    PUT /api/movies/:id
//@access   Private/Admin

const updateMovie = asyncHandler(async (req, res) => {
  try {
    // get data from request body
    const {
      name,
      desc,
      image,
      titleImage,
      rate,
      numberOfReviews,
      category,
      time,
      language,
      year,
      video,
      casts,
    } = req.body;

    //find movie by id in database
    const movie = await Movies.findById(req.params.id);

    if (movie) {
      //update movie data
      movie.name = name || movie.name;
      movie.desc = desc || movie.desc;
      movie.image = image || movie.image;
      movie.titleImage = titleImage || movie.titleImage;
      movie.rate = rate || movie.rate;
      movie.numberOfReviews = numberOfReviews || movie.numberOfReviews;
      movie.category = category || movie.category;
      movie.time = time || movie.time;
      movie.language = language || movie.language;
      movie.year = year || movie.year;
      movie.video = video || movie.video;
      movie.casts = casts || movie.casts;
    } else {
      res.status(404);
      throw new Error("Movie not found");
    }

    //save the movie in database
    const updatedMovie = await movie.save();
    //send the updated movie to the client;
    res.status(201).json(updatedMovie);
  } catch (error) {
    res.status(400).json({ message: error.message });
    throw new Error("Movie not found");
  }
});

//@desc   Delete a movie
//@route  DELETE /api/movies/:id
//@access Private/Admin

const deleteMovie = asyncHandler(async (req, res) => {
  try {
    //find movie by id in database
    const movie = await Movies.findById(req.params.id);
    //if the movie is found delete it
    if (movie) {
      await movie.remove();
      res.json({ message: "Movie removed" });
    }
    // if the movie is not found send 404 error
    else {
      res.status(404);
      throw new Error("Movie not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//@desc   Delete all movies
//@route  Delete /api/movies
//@access Private/Admin
const deleteAllMovies = asyncHandler(async (req, res) => {
  try {
    //delete all movies
    await Movies.deleteMany({});
    res.json({ message: "All movies has been deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//@desc   Create movie
//@route  POST /api/movies
//@access Private/Admin

const createMovie = asyncHandler(async (req, res) => {
  try {
    // get data from request body
    const {
      name,
      desc,
      image,
      titleImage,
      rate,
      numberOfReviews,
      category,
      time,
      language,
      year,
      video,
      casts,
    } = req.body;
    const movie = new Movies({
      name,
      desc,
      image,
      titleImage,
      rate,
      numberOfReviews,
      category,
      time,
      language,
      year,
      video,
      casts,
      userId: req.user._id,
    });
    if (movie) {
      const createdMovie = await movie.save();
      res.status(201).json(createdMovie);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
    throw new Error("Movie not found");
  }
});

export {
  importMovies,
  getMovies,
  getMovieById,
  getTopRatedMovies,
  getRadomMovies,
  createMovieReview,
  deleteMovieReview,
  updateMovie,
  deleteMovie,
  deleteAllMovies,
  createMovie,
};
