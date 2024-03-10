import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";


const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "trip-users";

const { uuid } = require('uuidv4');

export const handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      case "DELETE /items/{id}":
        console.log("DELETE /items/{id}");
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
        
      case "GET /items/{id}":
        let keyGet = {
          TableName: tableName,
          Key: {
            id: event.pathParameters.id,
          },
        };
        console.log("keyDynamo", keyGet);

        body = await dynamo.send(new GetCommand(keyGet));
        body = body.Item;
        break;
      case "GET /items":
        body = await dynamo.send(
          new ScanCommand({ TableName: tableName })
        );
        body = body.Items;
        break;
      case "PUT /items":
        let requestJSON = JSON.parse(event.body);
        let itemDynamo = {
          TableName: tableName,
          Item: {
            id: uuidv4(),
            identification_number: requestJSON.identification_number,
            name: requestJSON.name,
            mail: requestJSON.mail,
            phone: requestJSON.phone,
            pwd: requestJSON.pwd,
            rh: requestJSON.rh,
            //idViaje: requestJSON.idViaje,
          },
      };
      console.log("itemDynamo", itemDynamo);
      await dynamo.send(new PutCommand(itemDynamo));
      body = `Put item ${itemDynamo.Item.id}`;
      break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};

const EventEmitter = require('events')
const myEmitter = new EventEmitter()

var request = {
  body : '{"routeKey":"GET /items/{id}", "body":"{}"}',
 pathParameters: {
  "id": "a0b5a7ee-0dc5-4236-a6fc-d26a1fb593e9"},
 routeKey: 'GET /items/{id}'
}
myEmitter.on('event', async () => {
  const dogs = await handler(request)
  console.log(handler)
})
myEmitter.emit('event')
