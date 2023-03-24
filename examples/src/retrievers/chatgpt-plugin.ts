import { ChatGPTPluginRetriever } from "langchain/retrievers";

export const run = async () => {
  const retriever = new ChatGPTPluginRetriever({
    url: "http://0.0.0.0:8000",
    auth: {
      bearer: "super-secret-jwt-token-with-at-least-32-characters-long",
    },
  });

  const docs = await retriever.getRelevantTexts("hello world");

  console.log(docs);
};