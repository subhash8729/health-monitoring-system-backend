import express from "express"
import cors from "cors"
import authRouter from "./routes/auth.routes.js";
import caretakerRouter from "./routes/caretaker.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import morgan from "morgan";

const app = express();


app.use(cors({
    origin:"*"
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(morgan('tiny'))
app.use("/auth",authRouter);
app.use("/caretaker",caretakerRouter);
app.use("/doctor", doctorRouter)

app.listen(process.env.PORT,()=>{
    console.log("server is running on port = ", process.env.PORT)
})
