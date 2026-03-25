import express from "express"
import { db } from "../database.js"
import { isAnyEmpty } from "../functions/emptyCheck.js";
import { isLessThan1Min } from "../functions/generalfunction.js";



const router = express.Router();

const device_data = db.collection("device-data");
const monitoring_collection = db.collection("monitoring-collection")

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

router.post("/start-monitoring",async (req,res)=>{
    try {
        const {device_id, patient_id} = req.body;
        await monitoring_collection.deleteMany({device_id});
        await monitoring_collection.insertOne({device_id, patient_id,time_stamp:new Date()});
        return res.status(200).json({message:"Insertion success"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"server error"})
    }
})

router.post("/get-active-session", async(req,res)=>{
    try {
        const {device_id} = req.body;
        const device = await monitoring_collection.findOne({device_id});
        if(!device) return res.status(400).json({message:"no active session"})
        const result = isLessThan1Min(device.time_stamp);
        if(!result) return res.status(400).json({message:"no active session"})
        if(result) return res.status(200).json({patient_id:device.patient_id});

    } catch (error) {
        console.log("error in get-active-session",error)
        return res.status(500).json({message:"server error"})
    }
})
export default router