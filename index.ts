import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import typeDefs from "./schema/typeGql";
import resolvers from "./schema/resolvers";
const jwt = require("jsonwebtoken");


interface MyContext {
  token?: String;
}

const server = new ApolloServer<MyContext>({ typeDefs, resolvers });



async function connection() {
    const { url } = await startStandaloneServer(server, {
        context: async ({ req }) => ({ authorization: req.headers.authorization }),
        listen: { port: 4000 },
      });
      console.log(`🚀  Server ready at ${url}`);
}

connection();