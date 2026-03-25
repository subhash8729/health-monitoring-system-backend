import express from "express"
import { db } from "../database.js"
import { isAnyEmpty } from "../functions/emptyCheck.js";

const user_doctor = db.collection("users-doctor");
const user_caretaker = db.collection("users-caretaker")
const device_data = db.collection("device-data")

const router = express.Router();

router.post("/register-doctor", async (req, res) => {
    try {
        const { email, fullName, password } = req.body;
        if (isAnyEmpty(email, fullName, password)) {
            return res.status(400).json({ message: "blank details" });
        }
        const doctor = user_doctor.findOne({email});
        if(doctor) return res.status(400).json({reason:"email",message:"user with this email already exist"})
        await user_doctor.insertOne({ email, fullName, password });

        return res.status(201).json({ message: "insertion success" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "server error" });
    }
});

router.post("/register-caretaker", async (req, res) => {
    try {
        const { email, fullName, password, doctor_id } = req.body;

        if (isAnyEmpty(email, fullName, password, doctor_id)) {
            return res.status(400).json({ message: "blank details" });
        }

        const caretaker = user_caretaker.findOne({email});
        if(caretaker) return res.status(400).json({reason:"email",message:"user with this email already exist"})
        await user_caretaker.insertOne({ email, fullName, password, doctor_id });

        return res.status(201).json({ message: "insertion success" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "server error" });
    }
});


export default router