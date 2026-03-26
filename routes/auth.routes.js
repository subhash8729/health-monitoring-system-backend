import express from "express"
import { db } from "../database.js"
import { isAnyEmpty } from "../functions/emptyCheck.js";
import { generateCaretakerId, generateDoctorId } from "../functions/generalfunction.js";

const user_doctor = db.collection("users-doctor");
const user_caretaker = db.collection("users-caretaker")
const device_data = db.collection("device-data");
const increment = db.collection("increment_numbers")

const router = express.Router();

router.post("/register-doctor", async (req, res) => {
    try {
        const { email, fullName, password } = req.body;
        if (isAnyEmpty(email, fullName, password)) {
            return res.status(400).json({ message: "blank details" });
        }
        const doctor = await user_doctor.findOne({ email });
        if (doctor) return res.status(400).json({ reason: "email", message: "user with this email already exist" });
        const doctor_id = await generateDoctorId(increment);

        await user_doctor.insertOne({ doctor_id, email, fullName, password });

        return res.status(200).json({ message: "insertion success" });

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

        const caretaker = await user_caretaker.findOne({ email });
        if (caretaker) return res.status(400).json({ reason: "email", message: "user with this email already exist" });
        const is_doctor =await user_doctor.findOne({doctor_id});
        if(!is_doctor) return res.status(400).json({error_message:"no doctor found with this id"});

        const caretaker_id = await generateCaretakerId(increment)
        await user_caretaker.insertOne({ caretaker_id, email, fullName, password, doctor_id });

        return res.status(200).json({ message: "insertion success" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (isAnyEmpty(email, password)) {
            return res.status(400).json({ message: "blank details" });
        }
        const doctor = await user_doctor.findOne({ email, password });
        if (doctor) return res.status(200).json({ message: "login success",user_type:"doctor", doctor_id:doctor.doctor_id })

        const caretaker = await user_caretaker.findOne({ email, password });
        if (caretaker) return res.status(200).json({ message: "login success",user_type:"caretaker", caretaker_id:caretaker.caretaker_id })

        return res.status(400).json({ message: "invalid credentials" })


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "server error" });
    }
});



export default router