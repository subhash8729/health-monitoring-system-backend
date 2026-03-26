import express from "express"
import { db } from "../database.js"
import { isAnyEmpty } from "../functions/emptyCheck.js";



const router = express.Router();

const device_data = db.collection("device-data");
const device_assignment = db.collection("device-assignment");
const monitoring_collection = db.collection("monitoring-collection")
const user_caretaker = db.collection("users-caretaker")

router.post("/assign-device", async (req, res) => {
    try {
        const { device_id, device_name, caretaker_id } = req.body;

        if (isAnyEmpty(device_id, device_name, caretaker_id)) {
            return res.status(400).json({ message: "blank details" });
        }

        const existing = await user_caretaker.findOne({ device_id, device_name });
        if (existing) return res.status(400).json({ error_message: "device already assigned" })

        await user_caretaker.findOneAndUpdate({ caretaker_id }, {
            $set: {
                device_name,
                device_id,
            }
        });

        return res.status(200).json({ message: "assign success" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "server error" })
    }
})

router.post("/get-assigned-caretakers", async (req, res) => {
    try {
        let { doctor_id } = req.body;

        if (!doctor_id) {
            return res.status(400).json({ message: "blank details" });
        }

        const result = await user_caretaker.find({
            doctor_id: doctor_id,
            device_name: { $exists: true, $ne: null },
            device_id: { $exists: true, $ne: null }
        }).toArray();

        return res.status(200).json(result);

    } catch (error) {
        console.log("error in get-caretakers", error);
        return res.status(500).json({ message: "server error" });
    }
});

router.post("/get-non-assigned-caretakers", async (req, res) => {
    try {
        const { doctor_id } = req.body;
        const result = await user_caretaker.find({
            doctor_id: doctor_id,
            device_name: { $exists: false },
            device_id: { $exists: false }
        }).toArray();

        return res.status(200).json(result)

    } catch (error) {
        return res.status(500).json({ message: "server error" });
    }
})

export default router;