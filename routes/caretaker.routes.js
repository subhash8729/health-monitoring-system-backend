import express from "express"
import { db } from "../database.js"
import { isAnyEmpty } from "../functions/emptyCheck.js";



const router = express.Router();

const device_data = db.collection("device-data")

router.post("/upload-health-data",async (req, res) => {
    try {
        const { device_id, temprature, heart_rate, oxygen_level, blood_pressure, ecg } = req.body;
        if (isAnyEmpty(device_id, temprature, heart_rate, oxygen_level, blood_pressure, ecg)) {
            return res.status(400).json({ message: "blank details" });
        }

        await device_data.insertOne({device_id, temprature, heart_rate, oxygen_level, blood_pressure, ecg });

        return res.status(201).json({ message: "insertion success" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"server error"})
    }


})

export default router