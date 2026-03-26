import express from "express"
import { db } from "../database.js"
import { isAnyEmpty } from "../functions/emptyCheck.js";
import { generatePatientId, isLessThan1Min } from "../functions/generalfunction.js";



const router = express.Router();

const device_data = db.collection("device-data");
const monitoring_collection = db.collection("monitoring-collection")
const patient = db.collection("patients");
const increment = db.collection("increment_numbers")
const user_caretaker = db.collection("users-caretaker")

router.post("/upload-health-data", async (req, res) => {
    try {
        const { device_id, temprature, heart_rate, oxygen_level, blood_pressure, ecg } = req.body;
        if (isAnyEmpty(device_id, temprature, heart_rate, oxygen_level, blood_pressure, ecg)) {
            return res.status(400).json({ message: "blank details" });
        }

        await device_data.insertOne({ device_id, temprature, heart_rate, oxygen_level, blood_pressure, ecg });

        return res.status(201).json({ message: "insertion success" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "server error" })
    }


})
router.post("/upload-heart-rate", async (req, res) => {
    try {
        const { heart_rate, device_id, patient_id } = req.body;
        if (isAnyEmpty(device_id, patient_id, heart_rate)) {
            return res.status(400).json({ message: "blank details" });
        }

        await device_data.findOneAndUpdate(
            { device_id },
            { $set: { patient_id, heart_rate } }
        );

        return res.status(200).json({ message: "insertion success" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "server error" })
    }
})

router.post("/upload-spo2", async (req, res) => {
    try {
        const { spo2, device_id, patient_id } = req.body;
        if (isAnyEmpty(device_id, patient_id, spo2)) {
            return res.status(400).json({ message: "blank details" });
        }

        await device_data.findOneAndUpdate(
            { device_id },
            { $set: { patient_id, spo2 } }
        );

        return res.status(200).json({ message: "insertion success" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "server error" })
    }

})

router.post("/upload-temprature", async (req, res) => {
    try {
        const { temprature, device_id, patient_id } = req.body;
        if (isAnyEmpty(device_id, patient_id, temprature)) {
            return res.status(400).json({ message: "blank details" });
        }

        await device_data.insertOne({
            device_id, patient_id, temprature 
        })

return res.status(200).json({ message: "insertion success" });

    } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "server error" })
}

})

router.post("/upload-ecg", async (req, res) => {
    try {
        const { ecg, device_id, patient_id } = req.body;
        if (isAnyEmpty(device_id, patient_id, ecg)) {
            return res.status(400).json({ message: "blank details" });
        }

        await device_data.findOneAndUpdate(
            { device_id },
            { $set: { patient_id, ecg } }
        );

        return res.status(200).json({ message: "insertion success" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "server error" })
    }

})

router.post("/upload-bp", async (req, res) => {
    try {
        const { bp, device_id, patient_id } = req.body;
        if (isAnyEmpty(device_id, patient_id, bp)) {
            return res.status(400).json({ message: "blank details" });
        }

        await device_data.findOneAndUpdate(
            { device_id },
            { $set: { patient_id, bp } }
        );

        return res.status(200).json({ message: "insertion success" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "server error" })
    }

})

router.post("/start-monitoring", async (req, res) => {
    try {
        const { device_id, patient_id, patient_name } = req.body;
        await monitoring_collection.deleteMany({ device_id });
        await monitoring_collection.insertOne({ device_id, patient_id, patient_name, time_stamp: new Date() });
        return res.status(200).json({ message: "Insertion success" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "server error" })
    }
})

router.post("/stop-monitoring", async (req, res) => {
    try {
        const { device_id } = req.body;
        await monitoring_collection.deleteMany({ device_id });
        return res.status(200).json({ message: "stop success" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "server error" })
    }
});


router.post("/get-active-session", async (req, res) => {
    try {
        const { device_id } = req.body;
        const device = await monitoring_collection.findOne({ device_id });
        if (!device) return res.status(400).json({ message: "no active session" })
        const result = isLessThan1Min(device.time_stamp);
        if (!result) return res.status(400).json({ message: "no active session" })
        if (result) return res.status(200).json({ patient_id: device.patient_id, patient_name: device.patient_name });

    } catch (error) {
        console.log("error in get-active-session", error)
        return res.status(500).json({ message: "server error" })
    }
})

router.post("/add-patient", async (req, res) => {
    try {
        const { caretaker_id, patient_name, patient_age, patient_gender } = req.body;

        if (isAnyEmpty(caretaker_id, patient_name, patient_age, patient_gender)) return res.status(400).json({ message: "blank details" })
        const patient_id = await generatePatientId(increment);

        const caretaker = await user_caretaker.findOne({ caretaker_id })
        if (!caretaker || !caretaker.device_id) return res.status(400).json({ message: "either caretaker not registered or device not assigned" })

        await patient.insertOne({ device_id: caretaker.device_id, caretaker_id, patient_id, patient_name, patient_age, patient_gender })
        return res.status(200).json({ message: "insertion success" })

    } catch (error) {
        console.log("error in add-patient", error)
        return res.status(500).json({ message: "server error" })
    }
})

router.post("/get-patients", async (req, res) => {
    try {
        const { caretaker_id } = req.body;
        if (!caretaker_id) return res.status(400).json({ message: "blank details" })
        const patients = await patient.find({ caretaker_id }).toArray()
        return res.status(200).json(patients)

    } catch (error) {
        console.log("error in add-patient", error)
        return res.status(500).json({ message: "server error" })
    }
})

router.post("/get-patient-name", async (req, res) => {
    try {
        const { patient_id } = req.body || {};
        if (!patient_id) return res.status(400).json({ message: "blank details" })
        const patients = await patient.findOne({ patient_id })
        return res.status(200).json(patients)

    } catch (error) {
        console.log("error in get-patient-name", error)
        return res.status(500).json({ message: "server error" })
    }
})
export default router