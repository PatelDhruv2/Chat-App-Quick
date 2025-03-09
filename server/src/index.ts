import express, { Application, Request, Response } from "express";
import "dotenv/config";
import Routes from "./routes/index.js";
import cors from "cors";
const app: Application = express();
const PORT = process.env.PORT || 7000;

// * Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Debug logging for requests
app.use((req: Request, res: Response, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.get("/", (req: Request, res: Response) => {
    return res.send("It's working 🙌");
});

app.use("/api", Routes);

// Debug: Print registered routes
app._router.stack.forEach((r: any) => {
    if (r.route && r.route.path) {
        console.log(`Route registered: ${Object.keys(r.route.methods)} ${r.route.path}`);
    }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
