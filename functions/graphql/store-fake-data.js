const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-west-2",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  //   endpoint: "http://localhost:8000"
});
const docClient = new AWS.DynamoDB.DocumentClient();

var params = {
  RequestItems: {
    "dynamo-single-table-graphql": [
      {
        PutRequest: {
          Item: {
            pk: `user#112233`,
            sk: `metadata`,
            data: { firstName: "Chris", lastName: "Biscardi" }
          }
        }
      },
      {
        PutRequest: {
          Item: {
            pk: `user#112233`,
            sk: `address#1`,
            data: { street: "1 sesame st" }
          }
        }
      },
      {
        PutRequest: {
          Item: {
            pk: `user#112233`,
            sk: `address#2`,
            data: { street: "2 euclid ave" }
          }
        }
      },
      {
        PutRequest: {
          Item: {
            pk: `user#112233`,
            sk: `order#1`,
            data: { orderDate: "Jan", amount: 5, status: "delivered" }
          }
        }
      },
      {
        PutRequest: {
          Item: {
            pk: `user#112233`,
            sk: `order#2`,
            data: { orderDate: "Feb", amount: 3, status: "shipped" }
          }
        }
      },
      {
        PutRequest: {
          Item: {
            pk: `user#112233`,
            sk: `order#3`,
            data: { orderDate: "Mar", amount: 2, status: "pending" }
          }
        }
      }
    ]
  }
};

docClient
  .batchWrite(params)
  .promise()
  .then(result => console.log(result))
  .catch(e => console.log(e));
