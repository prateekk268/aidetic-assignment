const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
import { PrismaClient } from "@prisma/client";
const { authenticate } = require("../middleware");

const prisma = new PrismaClient();

const resolvers = {
  Query: {
    //  Query a list of all the movies
    movies: async (parent: any, args: any, context: any) => {
      try {
        const userId = authenticate(context);
        if (userId) {
          const movies = await prisma.movie.findMany();
          return movies;
        } else {
          throw new Error("User is not logged in");
        }
      } catch (err) {
        console.log(err);
        throw new Error(`${err}`);
      }
    },

    //  Query with pagination , search, etc
    moviesQuery: async (parent: any, args: any, context: any) => {
      try {
        const userId = await authenticate(context);
        if (userId) {
          const { sort, filter, pagination } = args;
          const { skip, take } = pagination;
          const { field, order } = sort;
          const { searchTerm } = filter;

          const movies = await prisma.movie.findMany({
            where: {
              OR: [
                { movieName: { contains: searchTerm } },
                { description: { contains: searchTerm } },
              ],
            },
            orderBy: { [field]: order },
            skip,
            take,
          });

          return movies;
        }
      } catch (err) {
        console.log(err);
        throw new Error(`${err}`);
      }
    },

    //  Query a movie with it’s id
    movie: async (parent: any, args: any, context: any) => {
      try {
        const { id } = args;
        if (id == null || id == "undefined")
          throw new Error("Movie Id is required");
        const userId = await authenticate(context);
        if (userId) {
          const movie = await prisma.movie.findUnique({
            where: { id: args.id },
          });
          if (!movie) throw new Error("No movie exist");
          return movie;
        } else {
          throw new Error("User is not logged in");
        }
      } catch (err) {
        console.log(err);
        throw new Error(`${err}`);
      }
    },

    // Query a list of reviews for a movie
    reviews: async (parent: any, args: any, context: any) => {
      try {
        const userId = await authenticate(context);
        if (userId) {
          const reviews = await prisma.review.findMany({
            where: { movieId: args.movieId },
          });
          if (!reviews) throw new Error("No reviews exist");
          return reviews;
        }
      } catch (error) {
        console.log(error);
      }
    },

    // get all review
    getAllReview: async (parent: any, args: any, context: any) => {
      try {
        const userId = await authenticate(context);
      
        if (!userId) throw new Error("User is not logged in");

        const reviewFind = await prisma.review.findMany();
        console.log(reviewFind);
        if (reviewFind.length == 0) throw new Error("No Reviewfound");
        let i = 0;
        let j = 1;
        while (j < reviewFind.length) {
          if (reviewFind[i].userId == userId) {
            i++;
            j++;
          } else if (reviewFind[j].userId == userId) {
            [reviewFind[i], reviewFind[j]] = [reviewFind[j], reviewFind[i]];
            j++;
            i++;
          } else {
            j++;
          }
        }
        return reviewFind;
      } catch (err) {
        console.log(err);
        throw new Error(`${err}`);
      }
    },
  },
  Mutation: {
    // signup
    signup: async (parent: any, args: any) => {
      try {
        const { userName, email, password } = args.user;
        // validation
        if (!userName && !email && !password) {
          throw new Error("Please enter all the required fields");
        }
        if (userName.trim().length === 0) throw new Error("Enter a username");
        if (email.trim().length === 0) throw new Error("Enter a email");
        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))
          throw new Error("Enter a valid email");
        if (password.trim().length === 0) throw new Error("Enter a password");

        const findUser = await prisma.user.findUnique({
          where: { email: email },
        });
        if (findUser) {
          throw new Error("User already exists with that email");
        } else {
          const hashedPassword = bcryptjs.hashSync(password, 10);
          const data = {
            userName,
            email,
            password: hashedPassword,
          };
          const newUser = await prisma.user.create({ data });
          return newUser;
        }
      } catch (err) {
        console.log(err);
        throw new Error(`${err}`);
      }
    },

    // login
    login: async (parent: any, args: any) => {
      try {
        const { email, password } = args;
        // validation
        if (!email && !password) {
          throw new Error("Please enter all the required fields");
        }
        if (email.trim().length === 0) throw new Error("Enter a email");
        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))
          throw new Error("Enter a valid email");
        if (password.trim().length === 0) throw new Error("Enter a password");

        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          const validPassword = bcryptjs.compareSync(password, user.password);
          if (validPassword) {
            const token = jwt.sign({ userId: user.id }, "JWT_SECRET");
            return { token };
          } else {
            throw new Error("Password is incorrect");
          }
        } else {
          throw new Error("Email is not registered");
        }
      } catch (err) {
        console.log(err);
        throw new Error(`${err}`);
      }
    },

    // changePassword
    changePassword: async (parent: any, args: any) => {
      try {
        const { email, oldPassword, newPassword } = args;
        // validation
        if (!email && !oldPassword && !newPassword) {
          throw new Error("Please enter all the required fields");
        }
        if (email.trim().length === 0) throw new Error("Enter a email");
        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))
          throw new Error("Enter a valid email");
        if (oldPassword.trim().length === 0)
          throw new Error("Enter your old password");
        if (newPassword.trim().length === 0)
          throw new Error("Enter a new password");

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error("User not found");
        }
        const validPassword = bcryptjs.compareSync(oldPassword, user.password);
        if (!validPassword) {
          throw new Error("Incorrect password");
        }
        const hashedPassword = bcryptjs.hashSync(newPassword, 10);
        // update password
        const isUpdate = await prisma.user.update({
          where: {
            email,
          },
          data: {
            password: hashedPassword,
          },
        });
        const msg = "Password sucessfully changed";
        if (isUpdate) return { msg };
        else throw new Error("Failed to change the password");
      } catch (err) {
        console.log(err);
        throw new Error(`${err}`);
      }
    },

    // create a movie
    createMovie: async (parent: any, args: any, context: any) => {
      try {
        const userId = await authenticate(context);
        if (userId) {
          const { movieName, description, directorName, releaseDate } =
            args.movie;
          // validation
          if (!movieName && !description && !directorName && !releaseDate) {
            throw new Error("Please enter all the required fields");
          }
          if (movieName.trim().length === 0)
            throw new Error("Enter a movie name");
          if (description.trim().length === 0)
            throw new Error("Enter a description");
          if (directorName.trim().length === 0)
            throw new Error("Enter a director name");
          if (releaseDate.trim().length === 0)
            throw new Error("Enter a release date");

          const data = {
            movieName,
            description,
            directorName,
            releaseDate: new Date(releaseDate),
          };
          const movie = await prisma.movie.create({ data });
          return movie;
        } else {
          throw new Error("User is not logged in");
        }
      } catch (err) {
        console.log(err);
        throw new Error(`${err}`);
      }
    },

    //  Delete a movie
    deleteMovie: async (parent: any, args: any, context: any) => {
      try {
        const userId = authenticate(context);
        if (userId) {
          const { id } = args;
          // validation
          if (id == null || id == "undefined")
            throw new Error("Movie Id is required");
          // check movie is avaible in movie table
          const isMovie = await prisma.movie.findUnique({ where: { id } });
          if (isMovie) {
            // check if review exist in related particular movie id;
            const isReview = await prisma.review.findMany({
              where: { movieId: id },
            });
            if (isReview.length > 0) {
              await prisma.review.deleteMany({
                where: { movieId: id },
              });
            }
          } else {
            throw new Error("Movie id is not available");
          }
          const isDeleted = await prisma.movie.delete({ where: { id } });
          if (isDeleted) {
            const msg = "Deleted movie sucessfully";
            return { msg };
          } else {
            throw new Error("Failed to delete the movie");
          }
        } else {
          throw new Error("User is not logged in");
        }
      } catch (err) {
        console.log(err);
        throw new Error(`${err}`);
      }
    },

    //Update an existing movie
    updateMovie: async (parent: any, args: any, context: any) => {
      try {
        const userId = authenticate(context);
        if (userId) {
          const { id } = args;
          // validation
          if (id == null || id == "undefined")
            throw new Error("Movie Id is required");

          const updateMovie = await prisma.movie.update({
            where: { id },
            data: args.movie,
          });
          if (!updateMovie) {
            throw new Error("Failed to update movie");
          } else {
            return updateMovie;
          }
        } else {
          throw new Error("User is not logged in");
        }
      } catch (error) {
        console.log(error);
      }
    },

    // create a review
    createReview: async (parent: any, args: any, context: any) => {
      try {
        const user = await authenticate(context);
        if (user) {
          const { movieId, rating, comment } = args.review;
          // validation
          if (movieId == null || movieId == "undefined")
            throw new Error("Movie Id is required");
          if (rating == null || rating == "undefined")
            throw new Error("Rating is required");
          if (
            comment == null ||
            comment == "undefined" ||
            comment.trim().length === 0
          )
            throw new Error("Comment is required");

          const isMovieID = await prisma.movie.findUnique({
            where: { id: movieId },
          });
          if (isMovieID) {
            const data = {
              movieId,
              rating,
              comment,
              userId: user,
            };

            const newReview = await prisma.review.create({ data });
            return newReview;
          } else {
            throw new Error("Movie ID is not valid");
          }
        } else {
          throw new Error("User is not logged in");
        }
      } catch (err) {
        console.log(err);
        throw new Error(`${err}`);
      }
    },

    //  Update an exiting review of a movie
    updateReview: async (parent: any, args: any, context: any) => {
      try {
        const userId = await authenticate(context);
        if (userId) {
          const { id } = args;
          if (id == null || id == "undefined")
            throw new Error("Review Id is required");
          const updateReview = await prisma.review.update({
            where: { id },
            data: args.review,
          });
          console.log(updateReview);
          if (updateReview) {
            return updateReview;
          } else {
            throw new Error("Review not found");
          }
        } else {
          throw new Error("User is not logged in");
        }
      } catch (err) {
        console.log(err);
        throw new Error(`${err}`);
      }
    },

    //  Delete an exiting review of a movie
    deleteReview: async (parent: any, args: any, context: any) => {
      try {
        const userId = await authenticate(context);
        if (userId) {
          const { id } = args;
          if (id == null || id == "undefined")
            throw new Error("Review Id is required");

          const reviewFind = await prisma.review.findUnique({ where: { id } });
          if (!reviewFind)
            throw new Error("Review not found or already deleted");

          const deleteReview = await prisma.review.delete({ where: { id } });
          if (deleteReview) {
            const msg = "Deleted review sucessfully";
            return { msg };
          } else {
            throw new Error("Review not found");
          }
        } else {
          throw new Error("User is not logged in");
        }
      } catch (err) {
        console.log(err);
        throw new Error(`${err}`);
      }
    },
  },
};

export default resolvers;
