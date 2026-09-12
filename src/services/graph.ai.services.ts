import { StateSchema, MessagesValue, ReducedValue, StateGraph, START, END } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import {mistralAIModel, cohereModel} from "./models.service.js"

const State = new StateSchema({
  messages: MessagesValue,
  solution_1:new ReducedValue(z.string().default(""),{
    reducer: (current,next)=>{
        return next
    }
  }),
  solution_2:new ReducedValue(z.string().default(""),{
    reducer: (current,next)=>{
        return next
    }
  }),
  judge_recommendation:new ReducedValue(z.object().default({
    solution_1_score:0,
    solution_2_score:0,

  }),
  {
    reducer:(current, next)=>{
        return next
    }
  }
)
});

const solutionNode: GraphNode<typeof State> = async (state: typeof State)=>{
    const [mistral_solution, cohere_solution] = await Promise.all([
        mistralAIModel.invoke(state.messages),
        cohereModel.invoke(state.messages)
    ])

    return{
        solution_1: mistral_solution.text,
        solution_2: cohere_solution.text
    }
}


const graph = new StateGraph(State)
    .addNode("solution", solutionNode)
    .addEdge(START, "solution")
    .addEdge("solution", END)
    .compile();

export default async function(userMessage:string){
    const result = await graph.invoke({
        messages: [
            new HumanMessage(userMessage)
        ]
    })

    console.log(result)

    return result.messages
}