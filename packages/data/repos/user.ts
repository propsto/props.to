import db from "../db";

export async function createUser(data: { email: string }) {
  return db.user.create({ data });
}
