import express from "express"
import cors from "cors"
import authRouter from "./routes/auth.routes.js";
import caretakerRouter from "./routes/caretaker.routes.js";

const app = express();


app.use(cors({
    origin:"*"
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/",(req,res,next)=>{console.log("req aayi", req.url); next()})
app.use("/auth",authRouter);
app.use("/caretaker",caretakerRouter);

app.listen(process.env.PORT,()=>{
    console.log("server is running on port = ", process.env.PORT)
})
