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
        console.log(email,fullName, password, doctor_id)
        if (isAnyEmpty(email, fullName, password, doctor_id)) {
            return res.status(400).json({ message: "blank details" });
        }

        await user_caretaker.insertOne({ email, fullName, password, doctor_id });

        return res.status(201).json({ message: "insertion success" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "server error" });
    }
});

export default router