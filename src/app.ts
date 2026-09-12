import express from 'express'
import useGraph from "./services/graph.ai.services.js"
import { HumanMessage } from "@langchain/core/messages";

const app = express()

app.get('/health', (req,res)=>{
    res.status(200).json({status: 'ok'})
})

app.post ("/use-graph", async (req,res)=>{
    await useGraph("What is the capital of France")
    
})


export default app