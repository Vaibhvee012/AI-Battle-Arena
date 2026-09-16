import express from "express";
import cors from "cors";

import runGraph from "./ai/graph.ai.js";

const app = express();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
}));

app.get("/", (_req, res) => {
    res.json({
        message: "AI Battle Arena API is running",
        status: "ok"
    });
});

app.post("/invoke", async (req, res) => {

    const problem =
        typeof req.body?.input === "string"
            ? req.body.input.trim()
            : "";

    if (!problem) {
        return res.status(400).json({
            error: "A problem statement is required."
        });
    }

    try {

        const result = await runGraph.invoke({
            problem
        });

        return res.status(200).json({
            message: "Graph executed successfully",
            success: true,
            result
        });

    } catch (error: any) {

        console.error(
            "AI Battle Arena error:",
            error?.message || error
        );

        return res.status(500).json({
            error: "Failed to generate solutions for the given problem.",
            details: error?.message || "Unknown error"
        });
    }
});

export default app;