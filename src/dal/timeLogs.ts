// TODO: Student implementation - Part 2: DAL for time logs
import { db } from '../db/database.js';

export type Timelog = {
  id: number;
  ticket_id: number;
  user_id: number;
  hours: number;
  logged_at: Date;
};

export async function insertTimeLog(
  ticketId: number,
  userId: number,
  hours: number,
): Promise<Timelog> {
  // TODO: Student implementation
  return db
    .insertInto('time_logs')
    .values({ ticket_id: ticketId, user_id: userId, hours })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getTotalHoursForTicket(
  ticketId: number,
): Promise<number> {
  // TODO: Student implementation
  const result = await db
    .selectFrom('time_logs')
    .select((eb) =>
      eb.fn.sum<string | number | null>('hours').as('total_hours'),
    )
    .where('ticket_id', '=', ticketId)
    .executeTakeFirst();

  return Number(result?.total_hours ?? 0);
}
