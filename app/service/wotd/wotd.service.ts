const crypto = require('crypto');

import { database } from "../../app";
import { ref as dRef, child, get, off, set } from "firebase/database";
import { logger } from "../../config/logger";


function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export class WOTDService {

    public words: any = [];
    public guessedWords = [];
    public word: string = "";

    configTypeDefs() {
        //get one wotd
        let typeDefs = `
          type Word {
            word: String,
            id: Int
          } `;

        /* typeDefs += ` 
          extend type Query {
            words: [String]
        }
        `; */

        typeDefs += ` 
          extend type Query {
            word: String
        }
        `;
        return typeDefs;
    }

    configResolvers(resolvers: any) {
        let dbRef = dRef(database);

        resolvers.Query.word = () => {
        
           return get(child(dbRef, '/words/word')).then((snapshot) => {
            if (snapshot.exists()) {
              this.words = snapshot.val();

              return this.getGuessedWords().then((val)=>{
                this.guessedWords = val;
                logger.info("guessed words");
                logger.info(this.guessedWords);

                //check if date is already in guess mode
                var currDate = new Date().toLocaleString("zh-HK").slice(0,10);
                var upDate = currDate.replace(/[^0-9\/]/g,'');
                var word = this.guessedWords.find(element => element["date"] == upDate);

                if(word){
                  var index = word["key"];
                  logger.info("index: ");
                  logger.info(index);
                  logger.info("word: ");
                  logger.info(this.words[index]);
                  this.word = this.words[index];
                }else{
                  //get random int and check in guessed words
                  var key = null 
                  var guessedLen =  this.guessedWords.length;

                  while(!key){
                    var len = this.words.length;
                    var k = getRandomInt(len);
                    var temp = this.guessedWords.find(element => element["key"] == k);
                    if(!temp) key = k;
                  }
                  
                  this.word = this.words[key];
                  //add in guessed word
                  logger.info(this.word);
                  set(dRef(database, 'words/guessed_words/' + guessedLen), {
                    date: upDate,
                    key: key
                  });
                }

                return this.word;
              });
             
            } else {
              logger.warn("No data available");
            }
          }).catch((error) => {
            logger.error(error);
          }); 
        };
    }


    getGuessedWords(){
      let dbRef = dRef(database);
     
      return get(child(dbRef, '/words/guessed_words')).then((snapshot) => {
        let words = []
        if (snapshot.exists()) {
          words = snapshot.val();
          var len = words.length
          logger.info(words);
        } else {
          logger.warn("No data available");
        }

        return words;
      }).catch((error) => {
        logger.error(error);
      }); 
    }

}

/*

query{
  word
}

*/