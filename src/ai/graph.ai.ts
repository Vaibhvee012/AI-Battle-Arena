import {StateGraph, type GraphNode, StateSchema} from "@langchain/langgraph"
import z from "zod"
import { mistralAIModel, cohereModel } from "./models.ai.js"

const state = new StateSchema({
    problem: z.string().default(""),
    solution_1: z.string().default(""),
    solution_2: z.string().default(""),
    judge: z.object({
        solution_1_score: z.number().default(0),
        solution_2_score: z.number().default(0),
        solution_1_reasoning: z.string().default(""),
        solution_2_reasoning: z.string().default(""),
    })

})

const solutionNode: GraphNode<typeof state> = async (state) =>{
    const [mistralResponse, cohereResponse] = await Promise.all([
        mistralAIModel.invoke(state.problem),
        cohereModel.invoke(state.problem)
    ])

    return{
        solution_1: mistralResponse.text,
        solution_2: cohereResponse.text
    }
}