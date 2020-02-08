const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-west-2",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  //   endpoint: "http://localhost:8000"
});
const docClient = new AWS.DynamoDB.DocumentClient();
const { ApolloServer, gql } = require("apollo-server-lambda");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    user: User
  }
  type User {
    firstName: String
    lastName: String
    addresses: [String]
    orders: [Order]
  }
  type Order {
    orderDate: String
    amount: Int
    status: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    user: async (parent, args, context, info) => {
      // if we could use OR in keycondition, we could limit
      // the data we queried for using the selectionSet.
      // As it stands we can only limit by filtering which
      // doesn't seem useful for this implementation, so
      // we end up fetching everything anyway.
      //
      // const selections = info.fieldNodes
      //   .find(({ name }) => name.value === "user")
      //   .selectionSet.selections.map(({ name }) => name.value);
      // console.log(selections);

      const params = {
        TableName: "dynamo-single-table-graphql",
        KeyConditionExpression: "pk = :user",
        ExpressionAttributeValues: {
          ":user": `user#112233`
        }
      };
      const { Items } = await docClient.query(params).promise();
      const results = Items.reduce(
        (acc, { pk, sk, data }) => {
          if (sk === "metadata") {
            return { ...acc, ...data };
          } else if (sk.startsWith("address#")) {
            return { ...acc, addresses: [...acc.addresses, data.street] };
          } else if (sk.startsWith("order#")) {
            return { ...acc, orders: [...acc.orders, data] };
          }
        },
        { addresses: [], orders: [] }
      );
      console.log("results", results);
      return results;
    }
  },
  User: {
    orders: (parent, args, context, info) => {
      // we can actually elide this whole resolver
      // since we're doing what happens anyway
      // we could also passthrough the raw results
      // and re-arrange the orders here instead of
      // in the parent resolver like we do now, etc.
      console.log("parent", parent.orders);
      return parent.orders;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,

  // By default, the GraphQL Playground interface and GraphQL introspection
  // is disabled in "production" (i.e. when `process.env.NODE_ENV` is `production`).
  //
  // If you'd like to have GraphQL Playground and introspection enabled in production,
  // the `playground` and `introspection` options must be set explicitly to `true`.
  playground: true,
  introspection: true
});

exports.server = server;
exports.handler = server.createHandler();
