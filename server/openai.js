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
    console.log(inputEmbeddingResponse.data.data[0].embedding);
    return inputEmbeddingResponse.data.data[0].embedding
}

async function createChatCompletion(messages) {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
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
    console.log(response.data.choices[0].message);
    return response.data.choices[0].message.content;
}

function summaryDialog(dialogs) {
    const dialog = dialogs.join(",");
    const messages = [
        {role: "system", content:"你是一个善于总结对话内容的大师,可以从对话中总结出关键信息,比如人物的性格,喜好,特征,出行计划等信息,并输出成不超过100字的一段描述"},
        {role: "user", content:""}]
    
}

module.exports = {createEmbedding, createChatCompletion}
