const fs = require("fs")
const crypto = require("crypto");
const path = require("path")

const { v4: uuidv4 } = require('uuid');

function encodeToSHA256(data) {
    const hash = crypto
      .createHash("sha256")
      .update(data)
      .digest("hex");
    return hash;
  }

function createDb(folderName ,dbName) {
    // 创建文件夹
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    const dbFilePath = path.join(folderName, dbName);
    try {
        if (!fs.existsSync(dbFilePath + ".json")) {
            fs.writeFileSync(dbFilePath + ".json", JSON.stringify([], null, 2));
            return console.log(`${dbFilePath + ".json"} file created successfully`);
        } else {
            return console.log(`${dbFilePath + ".json"} file already exists`);
        }
    } catch (e) {
        return console.log(`Error creating ${dbFilePath + ".json"} file:`, e);
    }
}


function readDb(dbName = "db.json") {
    const data = fs.readFileSync(dbName, "utf-8")
    return JSON.parse(data)
}

function writeDb(obj, folderName, dbName = "db.json") {
    const dbFilePath = path.join(folderName, dbName);
    // 创建文件夹
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    // 在文件夹中创建数据库文件
    if (!obj) {return console.log("Please provide data to save!")}
    try {
        let data = [];
        if (fs.existsSync(dbFilePath)) {
            const existingData = fs.readFileSync(dbFilePath, 'utf8');
            data = JSON.parse(existingData);
        }
        data.push(obj);
        fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
        console.log("Save succesful");
        return true;
    } catch (e) {
        console.log("Save failed! with the following errror:", e);
        return false;
    }
}
/*
function writeDb(obj, folderName, dbName = 'db.json') {
  const dbFilePath = path.join(folderName, dbName);

  return new Promise((resolve, reject) => {
    // 创建文件夹
    fs.mkdir(folderName, { recursive: true }, (err) => {
      if (err) {
        console.error(`Error creating directory: ${err}`);
        reject(err);
      } else {
        // 在文件夹中创建数据库文件
        fs.writeFile(dbFilePath, JSON.stringify([], null, 2), (err) => {
          if (err) {
            console.error(`Error creating database file: ${err}`);
            reject(err);
          } else {
            if (!obj) {
              console.log('Please provide data to save!');
              resolve();
            } else {
              try {
                fs.readFile(dbFilePath, 'utf8', (err, existingData) => {
                  if (err) {
                    console.error(`Error reading database file: ${err}`);
                    reject(err);
                  } else {
                    let data = JSON.parse(existingData);
                    data.push(obj);
                    fs.writeFile(dbFilePath, JSON.stringify(data, null, 2), (err) => {
                      if (err) {
                        console.error(`Error saving data to database file: ${err}`);
                        reject(err);
                      } else {
                        console.log('Save successful');
                        resolve();
                      }
                    });
                  }
                });
              } catch (e) {
                console.error(`Error saving data to database file: ${e}`);
                reject(e);
              }
            }
          }
        });
      }
    });
  });
}
*/
function saveMessage(obj, folderName, jsonName) {
    // 创建文件夹
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    // 在文件夹中创建数据库文件
    const dbFilePath = path.join(folderName, dbName);
    
    if (!obj) {return console.log("Please provide data to save!")}
    try {
        let data = readDb(dbFilePath);
        data.push(obj);
        fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
        return console.log("Save succesful")
    } catch (e) {
        return console.log("Save failed! with the following errror:", e)
    }
}

function getCurrentDateTime() {
    const date = new Date();
    const dateString = date.toLocaleDateString();
    const timeString = date.toLocaleTimeString();
    return `${dateString} ${timeString}`;
}      

// function cosineSimilarity(vecA, vecB) {
//     let dotProduct = 0;
//     let normA = 0;
//     let normB = 0;
//     for (let i = 0; i < vecA.length; i++) {
//         dotProduct += vecA[i] * vecB[i];
//         normA += Math.pow(vecA[i], 2);
//         normB += Math.pow(vecB[i], 2);
//     }
//     // console.log(dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)))
//     return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
// }

function clearJsonFile(folderName ,filename) {
    const dbFilePath = path.join(folderName, filename);
    let emptyData = JSON.stringify([]);
    fs.writeFileSync(dbFilePath, emptyData);
}

// function getSimilarTextFromDb(inputEmbedding, dbName = "db.json") {

//     let jsonData = JSON.parse(fs.readFileSync(dbName, 'utf-8'));
//     let result = [];
//     jsonData.forEach(embedding => {
//         let similarity = cosineSimilarity(inputEmbedding, embedding.input.embedding);
//         if (similarity > 0.5) {
//             result.push({
//                 interaction: `${embedding.input.text} ${embedding.output.text}`,
//                 similarity: similarity
//             });
//         }
//     });
//     result.sort((a, b) => b.similarity - a.similarity);
//     let topThree = result.slice(0, 5);

//     // topThree.reverse()
//     // console.log(`The top three most similar interactions are:`, topThree.map(r => r.interaction).join(""))
//     return topThree.map(r => r.interaction).join("");
//   }

function getSimilarTextFromDb(inputEmbedding, folderName, dbName = "db.json", threshold = 0.8) {
  const dbFilePath = path.join(folderName, dbName);
  let jsonData = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  console.log("getSimilarTextFromDb begin");
  let result = [];
  jsonData.forEach(embedding => {
    let similarity = calculateSimilarity(inputEmbedding, embedding.input.embedding);
    if (similarity >= threshold) { // 使用大于等于阈值的条件进行筛选
    result.push({
        interaction: `${embedding.input.text} ${embedding.output.text}`,
        similarity: similarity
    });
    }
  });

  result.sort((a, b) => b.similarity - a.similarity);
  
  let topThree = result.slice(0, 5); // 获取前三个最相似的文本
  console.log("getSimilarTextFromDb end")
  return topThree.map(r => r.interaction).join("\n");
}

function calculateSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += Math.pow(vecA[i], 2);
    normB += Math.pow(vecB[i], 2);
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
module.exports = { readDb, writeDb, getSimilarTextFromDb, getCurrentDateTime, encodeToSHA256, calculateSimilarity, createDb, clearJsonFile }
