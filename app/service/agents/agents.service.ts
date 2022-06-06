import { database } from "../../app";
import { ref as dRef, child, get, set, push, remove, update } from "firebase/database";
import { logger } from "../../config/logger";

export class AgentsService {

    public agents: any = [];

    configTypeDefs() {
        let typeDefs = `
          type Agent {
            firstName: String,
            lastName: String,
            id: String,
            dpURL: String
          } `;

        typeDefs += ` 
          extend type Query {
            agents: [Agent]
          }
          `;

        typeDefs += `
          extend type Mutation {
            agent(firstName:String,
             lastName: String,
             dpURL: String,
             id:String): Agent!,
             updateAgent(firstName:String,
              lastName: String,
              dpURL: String,
              id:String): Boolean,
             deleteAgent(id: String!): Boolean
          }`;
        return typeDefs;
    }

    configResolvers(resolvers: any) {
      //return agents.find()
      let dbRef = dRef(database, 'words');
        
        //READ
        resolvers.Query.agents = () => {

            return get(child(dbRef, '/agents')).then((snapshot) => {
              if (snapshot.exists()) {

                let agents:any = [];
                snapshot.forEach(function(childNodes){
                  var agent = childNodes.val();
                  agent.id = childNodes.key;
                  agents.push(agent)
                });

                this.agents = agents;
              } else {
                logger.warn("No data available");
              }
              return this.agents;
            }).catch((error) => {
              logger.error(error);
            });

        };

        //UPDATE
        resolvers.Mutation.updateAgent = (_: any, agent: any) => {
          
          let id = agent.id;
          delete agent.id;

          let agentRef =  dRef(database, '/words/agents/'+id);
          return update(agentRef, agent).then(() => {
            return true;
          })
          .catch((error) => {
            logger.error(error);
            return false
          })

        };

        //CREATE
        resolvers.Mutation.agent = (_: any, agent: any) => {
          let agentsListRef = push(dRef(database, 'words/agents'));

            return set(agentsListRef, {
              firstName: agent.firstName,
              lastName: agent.lastName,
              dpURL: agent.dpURL
            })
            .then(() => {
              agent.id = agentsListRef.key;
              return agent
            })
            .catch((error) => {
              logger.error(error);
            });
        };


        //DELETE
        resolvers.Mutation.deleteAgent = (_: any, {id}: any) => {
          let agentRef =  dRef(database, '/words/agents/'+id);
          return remove(agentRef).then(() => {
            return true
          })
          .catch((error) => {
            logger.error(error);
            return false
          });
          
        };

    }

}


/* 
query{
  agents{
      firstName,
      id
  }
}
mutation{
  agent(firstName:"Bean",
             lastName: "Stony",
             dpURL: "https://www.pngfind.com/pngs/m/610-6104451_image-placeholder-png-user-profile-placeholder-image-png.png"){
      id
  }
}
mutation{
  deleteAgent(id:"")
}

mutation{
  updateAgent(id:"", firstName:"Karen")
}
*/

