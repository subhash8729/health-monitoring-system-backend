import { db } from "../database.js";

const user_doctor = db.collection("users-doctor");


async function generateDoctorId() {
  let last = await user_doctor.findOne().sort({ _id: -1 }).lean();

  let num = 1;

  if (last && last.doctor_id) {
    let lastNum = parseInt(last.doctor_id.split("-")[1]);
    num = lastNum + 1;
  }

  return `DR-${num.toString().padStart(4, "0")}`;
}

export function isLessThan1Min(oldTime){
  return (Date.now() - new Date(oldTime).getTime()) < 60000;
}