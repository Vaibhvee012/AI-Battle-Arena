import {StateGraph, type GraphNode, START, END, StateSchema} from "@langchain/langgraph";
import z from "zod";
import {groqModel, cohereModel, geminiModel} from "./models.ai.js";
import {createAgent, providerStrategy} from "langchain";
import { HumanMessage } from "@langchain/core/messages";


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
});


// Solution Node
const solutionNode: GraphNode<typeof state> = async (state) => {
    console.log("Generating solutions...");
    try {
        const mistralResponse = await groqModel.invoke(
            state.problem
        );
        console.log("Gorq solution generated.");
        const cohereResponse = await cohereModel.invoke(
            state.problem
        );
        console.log("Cohere solution generated.");
        return {
            solution_1: mistralResponse.text,
            solution_2: cohereResponse.text
        };
    } catch (error: any) {
        console.error("AI model error:");
        console.error(error?.message || error);
        throw error;
    }
};


// Judge Node
const judgeNode: GraphNode<typeof state> = async (state) => {
    const {
        problem,
        solution_1,
        solution_2
    } = state;
    const judge = createAgent({
        model: geminiModel,
        responseFormat: providerStrategy(
            z.object({
                solution_1_score: z
                    .number()
                    .min(0)
                    .max(10),
                solution_2_score: z
                    .number()
                    .min(0)
                    .max(10),
                solution_1_reasoning: z.string(),
                solution_2_reasoning: z.string()
            })
        ),
        systemPrompt: `
            You are a judge for a problem-solving competition.
            You will be given a problem and two solutions.
            Evaluate the solutions based on:
            - Correctness
            - Efficiency
            - Clarity
             Give each solution a score from 0 to 10.
             Also provide reasoning for each score.`
    });


    const judgeResponse = await judge.invoke({
        messages: [
            new HumanMessage(`
                Problem: ${problem}
                Solution 1:
                ${solution_1}
                Solution 2:
                ${solution_2}
                Evaluate both solutions and provide
                scores and reasoning.
            `)
        ]
    });

    const {
        solution_1_score,
        solution_2_score,
        solution_1_reasoning,
        solution_2_reasoning
    } = judgeResponse.structuredResponse;

    return {
        judge: {
            solution_1_score,
            solution_2_score,
            solution_1_reasoning,
            solution_2_reasoning
        }
    };
};


// Create Graph
const graph = new StateGraph(state)
    .addNode("solution", solutionNode)
    .addNode("judge_node", judgeNode)
    .addEdge(START, "solution")
    .addEdge("solution", "judge_node")
    .addEdge("judge_node", END)
    .compile();
export default graph;


// Run Graph
async function runGraph(problem: string) {
    const result = await graph.invoke({
        problem
    });
    return result;
}