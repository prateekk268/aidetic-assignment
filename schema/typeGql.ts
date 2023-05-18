const typeDefs = `#graphql

type User {
  id: ID!
  userName: String!
  email: String!
  password: String!
}

input UserInput {
  userName: String!
  email: String!
  password: String!
}

type Token {
  token: String!
}

type Msg {
  msg: String
}

type Movie {
  id: ID!
  movieName: String!
  description: String!
  directorName: String!
  releaseDate: String!
}

input MovieInput {
  movieName: String!
  description: String!
  directorName: String!
  releaseDate: String!
}

input updateMovieInput {
  movieName: String
  description: String
  directorName: String
  releaseDate: String
}

type Review {
  id: Int!
  movieId: Int!
  userId: Int!
  rating: Int!
  comment: String!
}

input ReviewInput {
  movieId: Int!
  rating: Int!
  comment: String!
}

input updateReviewInput {
  rating: Int
  comment: String
}

input SortInput {
  field: String!
  order: SortOrder!
}

enum SortOrder {
  asc
  desc
}

input FilterInput {
  searchTerm: String
}

input PaginationInput {
  skip: Int
  take: Int
}


type Query {
  movies: [Movie!]!
  moviesQuery(sort: SortInput, filter: FilterInput, pagination: PaginationInput): [Movie!]!
  movie(id: Int!): Movie
  reviews(movieId: Int!): [Review!]!
}

type Mutation {
  signup(user: UserInput!): User
  login(email: String!, password: String!): Token
  changePassword(email: String!, oldPassword: String!, newPassword: String!): Msg
  createMovie(movie: MovieInput!): Movie
  updateMovie(id: Int!, movie: updateMovieInput!): Movie
  deleteMovie(id: Int!): Msg
  createReview(review: ReviewInput!): Review
  updateReview(id: Int!, review: updateReviewInput!): Review
  deleteReview(id: Int!): Msg
}


`;

export default typeDefs;

// movies: [Movie!]!
