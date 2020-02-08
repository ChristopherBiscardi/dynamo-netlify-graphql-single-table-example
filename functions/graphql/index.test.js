const server = require(".");

server.handler(
  {
    headers: {},
    httpMethod: "POST",
    path: "/graphql",
    body: JSON.stringify({
      query: `
        {
          user {
            firstName
            addresses
            orders {
              orderDate
            }
          }
        }
      `
    })
  },
  {},
  (err, v) => console.log("v", v)
);
