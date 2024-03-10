import { createRequire } from "module";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { main } from "../src/service.js";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";


console.log("Hello people");

const require = createRequire(import.meta.url);

const { v4: uuidv4 } = require("uuid");

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "trip-payments";

export const handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };
  try {
    console.log("event: ", event);
    event = JSON.parse(event.body);
    console.log("event: ", event);
    console.log("event.routeKey", event.routeKey);
    const requestJSON = JSON.parse(event.body);
    console.log("requestJSON: ", requestJSON);
    console.log("switch", event.routeKey);
    switch (event.routeKey) {
      case "DELETE /payments/{id}":
        console.log("DELETE /payments/{id}");
        let keyDelete = {
          TableName: tableName,
          Key: {
            id: event.pathParameters.id,
          },
        };

        await dynamo.send(new DeleteCommand(keyDelete));
        console.log("keyDelete", keyDelete);
        body = `Deleted item ${keyDelete.Key.id}`;
        break;
      case "GET /payments/{id}":
        let keyGet = {
          TableName: tableName,
          Key: {
            id: event.pathParameters.id,
          },
        };
        console.log("keyGet", keyGet);

        body = await dynamo.send(new GetCommand(keyGet));
        body = body.Item;
        break;
      case "GET /payments":
        body = await dynamo.send(new ScanCommand({ TableName: tableName }));
        body = body.payments;
        break;
      case "UPDATE /payments/{id}":
        //let name = requestJSON.name;
        console.log("UPDATE1 ");
        let params = {
          TableName: tableName,
          Key: {
            id: event.pathParameters.id,
          },
          UpdateExpression: "set description = :description , amount = :amount , paymentUsers = :paymentUsers , idTrip = :idTrip",
          ExpressionAttributeValues: {
            ":description": requestJSON.description,
            ":amount": requestJSON.amount,
            ":paymentUsers": requestJSON.paymentUsers,
            ":idTrip": requestJSON.idTrip,
          },
        };

        console.log("params", params);
        console.log("update 2");
        await dynamo.send(new UpdateCommand(params));
        body = `UPDATE /payments ${params.Key.id}`;
        break;

      case "PUT /payments":
        console.log("PUT /payments");
        //let requestJSON = JSON.parse(event.body);
        console.log("requestJSON: ", requestJSON);
        let keyPut = {
          TableName: tableName,
          Item: {
            id: uuidv4(),
            description: requestJSON.description,
            amount: requestJSON.amount,
            paymentUsers: requestJSON.paymentUsers,
            idTrip: requestJSON.idTrip,
          },
        };
        console.log("keyPut", keyPut);
        await dynamo.send(new PutCommand(keyPut));
        body = `Put item ${keyPut.Item.id}`;
        break;

      case "POST /payments":
        console.log("POST /payments");
        console.log("requestJSON.operation:", requestJSON.operation);
        let data = await main(requestJSON.idTrip, requestJSON.operation);
        console.log("requestJSON.operation:", requestJSON);
        console.log("data", data);
        body = { "data": data };

        break;
    }

  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
    console.log(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};

/*
const EventEmitter = require('events')
const myEmitter = new EventEmitter()

var request = {
  body: '{\"routeKey\":\"POST /payments\",\"body\":{\"idTrip\":\"Medellin\",\"operation\":\"getAmountByUser\"}}'

  /* Request GET /users/{id}
body : '{"routeKey":"GET /items/{id}", "body":"{}","pathParameters":{"id": "a0b5a7ee-0dc5-4236-a6fc-d26a1fb593e9"}}',
pathParameters: '{"id": "a0b5a7ee-0dc5-4236-a6fc-d26a1fb593e9"}',
routeKey: 'GET /items/{id}'*/
/*}
myEmitter.on('event', async () => {
  const dogs = await handler(request)
  //console.log(handler)
})
myEmitter.emit('event')*/