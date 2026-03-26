import express from "express"
import { db } from "../database.js"
import { isAnyEmpty } from "../functions/emptyCheck.js";
import { generatePatientId, isLessThan1Min, randomString } from "../functions/generalfunction.js";



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
    const { heart_rate, spo2, session_key } = req.body;
    if (!spo2 || !heart_rate) {
        return res.status(400).json({ message: "blank details" });
    }
    const patient_data = await monitoring_collection.findOne({ session_key });
    const device_datas = await device_data.findOne({ session_key });
    if (device_datas) {
        await device_data.findOneAndUpdate(
            { session_key },
            { $set: { patient_id: patient_data.patient_id, device_id: patient_data.device_id, spo2, heart_rate } }
        );
        return res.status(200).json({ message: "success" })
    }
    else {
        await device_data.insertOne(
            { patient_id: patient_data.patient_id, device_id: patient_data.device_id, time_stamp: patient_data.time_stamp, session_key, spo2, heart_rate }
        );

        return res.status(200).json({ message: "insertion success" });
    }
})

router.post("/upload-temprature", async (req, res) => {
    const { temprature, session_key } = req.body;
    if (!temprature) {
        return res.status(400).json({ message: "blank details" });
    }
    const patient_data = await monitoring_collection.findOne({ session_key });
    const device_datas = await device_data.findOne({ session_key });
    if (device_datas) {
        await device_data.findOneAndUpdate(
            { session_key },
            { $set: { patient_id: patient_data.patient_id, device_id: patient_data.device_id, temprature } }
        );
        return res.status(200).json({ message: "success" })
    }
    else {
        await device_data.insertOne(
            { patient_id: patient_data.patient_id, device_id: patient_data.device_id, time_stamp: patient_data.time_stamp, session_key, temprature }
        );

        return res.status(200).json({ message: "insertion success" });
    }
})

router.post("/upload-ecg", async (req, res) => {
    const { ecg, session_key } = req.body;
    if (!ecg) {
        return res.status(400).json({ message: "blank details" });
    }
    const patient_data = await monitoring_collection.findOne({ session_key });
    const device_datas = await device_data.findOne({ session_key });
    if (device_datas) {
        await device_data.findOneAndUpdate(
            { session_key },
            { $set: { patient_id: patient_data.patient_id, device_id: patient_data.device_id, ecg } }
        );
        return res.status(200).json({ message: "success" })
    }
    else {
        await device_data.insertOne(
            { patient_id: patient_data.patient_id, device_id: patient_data.device_id, time_stamp: patient_data.time_stamp, session_key, ecg }
        );

        return res.status(200).json({ message: "insertion success" });
    }

})

router.post("/upload-bp", async (req, res) => {
    try {
        const { bp, session_key } = req.body;
        if (!bp) {
            return res.status(400).json({ message: "blank details" });
        }
        const patient_data = await monitoring_collection.findOne({ session_key });
        const device_datas = await device_data.findOne({ session_key });
        if (device_datas) {
            await device_data.findOneAndUpdate(
                { session_key },
                { $set: { patient_id: patient_data.patient_id, device_id: patient_data.device_id, bp } }
            );
            return res.status(200).json({message:"success"})
        }
        else {
            await device_data.insertOne(
                { patient_id: patient_data.patient_id, device_id: patient_data.device_id, time_stamp: patient_data.time_stamp, session_key, bp }
            );

            return res.status(200).json({ message: "insertion success" });
        }



    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "server error" })
    }

})

router.post("/start-monitoring", async (req, res) => {
    try {
        const { device_id, patient_id, patient_name } = req.body;
        if (isAnyEmpty(device_id, patient_id, patient_name)) return res.status(400).json({ message: "blank fields" })
        await monitoring_collection.deleteMany({ device_id });
        await monitoring_collection.insertOne({ device_id, patient_id, patient_name, time_stamp: new Date(), session_key: randomString(6) });
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
        if (result) return res.status(200).json({ patient_id: device.patient_id, patient_name: device.patient_name, session_key: device.session_key });

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