import { db } from "../database.js";

const user_doctor = db.collection("users-doctor");


export async function generateDoctorId(increment) {

  const numbers = await increment.find().toArray();
  const doctor_num = Number(numbers[0].doctor);
  const doctor_id = "DR-"+doctor_num;
  await increment.deleteMany({});
  await increment.insertOne({ doctor: doctor_num + 1, caretaker: numbers[0].caretaker, patient: numbers[0].patient });
  return doctor_id;
}

export function isLessThan1Min(oldTime) {
  return (Date.now() - new Date(oldTime).getTime()) < 60000;
}

export async function generateCaretakerId(increment) {

  const numbers = await increment.find().toArray();
  const caretaker_num = Number(numbers[0].caretaker);
  const caretaker_id = "CT-"+caretaker_num;
  await increment.deleteMany({});
  await increment.insertOne({ doctor: numbers[0].doctor, caretaker: caretaker_num+1, patient: numbers[0].patient });
  return caretaker_id;
}

export async function generatePatientId(increment) {

  const numbers = await increment.find().toArray();
  const patient_num = Number(numbers[0].patient);
  const patient_id = "PT-"+patient_num;
  await increment.deleteMany({});
  await increment.insertOne({ doctor: numbers[0].doctor, caretaker: numbers[0].caretaker, patient: patient_num+1 });
  return patient_id;
}

