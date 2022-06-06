
import express from 'express';
import graphqlHTTP from 'express-graphql';
import {makeExecutableSchema} from 'graphql-tools';

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from "./config/firebasconfig";
import { getDatabase } from "firebase/database";

/* services */
import { AgentsService } from './service/agents/agents.service';
import { WOTDService } from './service/wotd/wotd.service';


const firebaseapp = initializeApp(firebaseConfig);
const app: express.Application = express();
const port = 3000;

export const database = getDatabase(firebaseapp); //can export this if needed



// sample non-file schema def
let typeDefs: any = [`
  type Query {
    hello: String
  }
     
  type Mutation {
    hello(message: String) : String
  }
`];

let helloMessage: String = 'World!';

// ?? error catching ?? 
let resolvers = {
    Query: {
        hello: () => helloMessage
    },
    Mutation: {
        hello: (_: any, helloData: any) => {
            helloMessage = helloData.message;
            return helloMessage;
        }
    }
};

// services
let agentsService = new AgentsService();
let wotdService = new WOTDService();
typeDefs += agentsService.configTypeDefs();
typeDefs += wotdService.configTypeDefs();

agentsService.configResolvers(resolvers);
wotdService.configResolvers(resolvers);

app.use(
    '/graphql',
    graphqlHTTP({
        schema: makeExecutableSchema({typeDefs, resolvers}),
        graphiql: true
    })
);
app.listen(port, () => console.log(`Node Graphql API listening on port ${port}!`));

//graphql-tools : typefs - inlcude schema defs ;resolvers - optional obj with resolvers format
//https://www.apollographql.com/docs/apollo-server/v2/api/graphql-tools/

//https://firebase.google.com/docs/database/web/read-and-write
//https://firebase.blog/posts/2021/10/protecting-backends-with-app-check 

/* TO DO */
//Validations for new items;
//Handling errors properly with a generic error service;
// Validating fields that a user can use at each request with a generic service;
// Add a JWT interceptor to secure the API;
// Handle password hash with a more effective approach;
// Add unit and integration tests;