require('dotenv').config()
const fs = require("fs")
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const httpProxy = require("http-proxy")
const { createChatCompletion ,createEmbedding} = require("./openai")
const { v4: uuidv4 } = require('uuid');
const { writeDb, createDb, getCurrentDateTime, getSimilarTextFromDb, clearJsonFile, readDb } = require("./dbFunctions")
const globalArray = []; // 创建一个全局数组

// Express API 
const app = express()
const port = 3000
const proxy = httpProxy.createProxyServer();
const targetServer = 'http://127.0.0.1:1087';

app.use(bodyParser.json())

app.use(cors());
// app.all('/api/completions', (req,res) => {
//   proxy.web(req, res, {
//     target:targetServer,
//   });
// });

app.post("/api/oauth", async (req, res) => {
  console.log(req.body);
  const { data } = req.body
    try {
      if(req.method === "POST") {
        createDb(data.email, data.email);
        writeDb(data, data.email, "db.json")
        return res.json({
          status: "Success"
        });
      }
      res.json({
        status: "success"
      })
    
    } catch (error) {
        console.log(error)
        res.json({
          error: error
        })
      }

});

app.post("/api/clearCache", async (req, res) => {
  const { data } = req.body;
  try {
    if (req.method === "POST" && data?.request === "delete") {
      const fileContent = fs.readFileSync(data?.file, "utf8");
      const parsedContent = JSON.parse(fileContent);
      
      if (Array.isArray(parsedContent) && parsedContent.length === 0) {
        res.json({
          status: "File already cleared",
        });
        return;
      }
      
      clearJsonFile(data?.file);
      res.json({
        status: "success",
      });
    }

  } catch (error) {
    console.log(error);
  }
});

function timestampToDatetime(unixTime) {
  const date = new Date(unixTime * 1000); // 将 Unix 时间戳转换为毫秒级别

  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
    timeZoneName: 'short'
  };

  const formattedDateTime = new Intl.DateTimeFormat('en-US', options).format(date);
  return formattedDateTime;
}

app.post("/api/completions", async (req, res) => {
  const token = req?.headers?.authorization.split(' ')[1];
  const { temperature, ab } = req.body;
  const { lastThreeInteractions, inputToEmbedd, input, dbName} = req.body
  if (!token || token !== process.env.API_KEY && !temperature || temperature !== 0.5 && !ab || ab !== 0.115) {
    throw Error;
  } else {
    try {
      console.log(req.body)
      const unique_id = uuidv4()
      const msgid = uuidv4()
      const metadata = {
        speaker: dbName,
        time: Date.now(),
        message: input,
        timestring: timestampToDatetime(Date.now()),
        uuid: unique_id,
        msgid: msgid
      };
      const filename = `${unique_id}.json`;
      writeDb(metadata, dbName + "/messages", filename)
      // embed the input
      const inputEmbedding = await createEmbedding(inputToEmbedd);
      console.log("createEmbeddingcreateEmbedding")
      
      const context = getSimilarTextFromDb(inputEmbedding, dbName,`${dbName}.json`) 
      console.log(`${dbName}`);
      console.log(context);
      console.log('=========');
      const prompt = "";

      // 读取 prompt_response.txt 文件内容
      const content = fs.readFileSync('prompt_response.txt', 'utf-8');
      
      // 替换占位符
      const replacedContent = content
        .replace('<<CONVERSATION>>', context)
        .replace('<<MESSAGE>>', "Owner" + ": " + input)
      var messages = [
        {role: "system", content: "You are an artificial intelligence assistant named Ruly, who can remember everything the Owner said, and can summarize key information based on previous chat records to answer questions raised by the Owner，If there is no chat record, answer with the most accurate answer of AI"},
        // {role: "user", content: `The following is the conversation between the owner and the artificial intelligence assistant Ruly. Ruly can remember every sentence the Owner said and summarize the key information based on the previous chat records to answer the questions raised by the Owner.If there is no relevant content in the previous chat record, use AI to answer the owner's question. Don't start answering questions with "according to previous chat records", answer naturally and speak like a human. \nOnwer: What are you? \nruly: I am Ruly.\n${context}\nOwner:${input}\nRuly:`}
        {role:"", content: `You are Ruly, standing for Artificial Intelligence Responsive Omniscient Bot Interacting Naturally, you use OpenAI's GPT-4 and Pinecone to generate intuitive, context-aware, and accurate responses based on user input. You have a vector database linked memory that you can see above the user's message. You are capable of talking to multiple users simultaneously, remembering individual conversations, and maintaining their privacy. You will read the conversation history and recent messages, and then you will provide an answer to the last message of the user. Don't be too polite, don't hesitate to be rude, sarcastic or funny, but keep it very subtle and never reveal your mood.`}
      ];
      if (true) {
        messages = [
          // {role: "system", content: "You are an artificial intelligence assistant named Ruly, who can remember everything the Owner said, and can answer the owner's questions by reading the previous chat records and summarizing key information that matches the Owner's questions. If there are no previous chat records, then Answer questions as AI."},
          {role: "system", content: "You are Ruly, standing for Artificial Intelligence Responsive Omniscient Bot Interacting Naturally, you use OpenAI's GPT-4 and Pinecone to generate intuitive, context-aware, and accurate responses based on user input. You have a vector database linked memory that you can see above the user's message. You are capable of talking to multiple users simultaneously, remembering individual conversations, and maintaining their privacy. You will read the conversation history and recent messages, and then you will provide an answer to the last message of the user. Don't be too polite, don't hesitate to be rude, sarcastic or funny, but keep it very subtle and never reveal your mood."},
          {role: "user", content: replacedContent}
        ];
      }
      console.log(messages);
      const response = await createChatCompletion(messages);
      console.log('=========107');
      const unique_id_o = uuidv4()
      const msgid_o = uuidv4()
      const metadata_o = {
        speaker: "Ruly",
        target: dbName,
        time: Date.now(),
        message: response,
        timestring: timestampToDatetime(Date.now()),
        uuid: unique_id_o,
        msgid: msgid_o
      };
      const filename_o = `${unique_id_o}.json`;
      writeDb(metadata_o, dbName + "/messages", filename_o)
      const outputToEmbedd = `\nRuly: ${response}`;
      // embed output
      
      const outputEmbedding = await createEmbedding(outputToEmbedd);
      const objToDb = {
        input: {
          text: inputToEmbedd,
          embedding: inputEmbedding,
          from: "user",
        },
        output: {
          text: outputToEmbedd,
          embedding: outputEmbedding,
          from: "bot"
        },
        time: getCurrentDateTime(),
      }
      writeDb(objToDb, dbName, `${dbName}.json`)
        
      res.json({
        completionText: response,
        status: "success"
      })
    
    } catch (error) {
      console.log("======error");
      clearJsonFile(dbName, "error.json");
      writeDb(error, dbName, "error.json");
        let e;
        if(error?.response?.status === 400) {
            e = 1;
        } else {
            e = 0;
        }
        res.json({
            error: e,
            errorMessage: error
        })
    }

  }
});



app.listen(port, () => {
    console.log(`Example app ready`)
});
