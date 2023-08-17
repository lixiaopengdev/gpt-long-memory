const { Configuration,  OpenAIApi } = require("openai")

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
const openai = new OpenAIApi(configuration);

async function createEmbedding(outputToEmbedd) {
    // embed output
    const inputEmbeddingResponse =  await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: outputToEmbedd
    });
    return inputEmbeddingResponse.data.data[0].embedding
}

async function createChatCompletion(messages) {
    const response = await openai.createChatCompletion({
        model: gpt-3.5-turbo,
        messages: messages,
        temperature: 0.1,
        max_tokens: 500,
        // n: 3,
        // best_of: 1,
        // top_p: 1,
        // frequency_penalty: 0,
        // presence_penalty: 0.6,
        stop: [ 'Ruly: ', 'Owner: ' ],
    });
    return response.data.choices[0].message.content;
}

async function summaryDialog(dialogs) {
    const dialog = dialogs.join(",");
    const messages = [
        {role: "system", content:"你是一个善于总结对话内容的大师,可以从对话中总结出关键信息,比如人物的性格,喜好,特征,出行计划等信息,并输出成不超过100字的一段描述"},
        {role: "user", content:`${dialog} 将上述对话总结出重点信息,不超过100个字 END`}]
    const response = await openai.createChatCompletion({
        model:"gpt-3.5-turbo",
        messages: messages,
        temperature:0.3,
        max_tokens:1000,
        stop:["END"],
    });
    return response.data.choices[0].message.content
}

module.exports = {createEmbedding, createChatCompletion, summaryDialog}
