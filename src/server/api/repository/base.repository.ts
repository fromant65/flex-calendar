/**
 * Base repository with common CRUD operations
 */

import { type SQL, eq } from "drizzle-orm";
import { type PgTable } from "drizzle-orm/pg-core";
import { db } from "~/server/db";

export class BaseRepository<TTable extends PgTable> {
  constructor(protected table: TTable) {}

  /**
   * Create a new record
   */
  async create(data: TTable["$inferInsert"]): Promise<TTable["$inferSelect"]> {
    const [result] = await db.insert(this.table).values(data).returning();
    return result!;
  }

  /**
   * Find record by ID
   */
  async findById(id: number): Promise<TTable["$inferSelect"] | undefined> {
    const [result] = await db
      .select()
      .from(this.table as any)
      .where(eq((this.table as any).id, id));
    return result;
  }

  /**
   * Find all records matching a condition
   */
  async findMany(condition?: SQL): Promise<TTable["$inferSelect"][]> {
    if (condition) {
      return await db.select().from(this.table as any).where(condition);
    }
    return await db.select().from(this.table as any);
  }

  /**
   * Update a record by ID
   */
  async updateById(
    id: number,
    data: Partial<TTable["$inferInsert"]>
  ): Promise<TTable["$inferSelect"] | undefined> {
    const [result] = await db
      .update(this.table)
      .set(data)
      .where(eq((this.table as any).id, id))
      .returning();
    return result;
  }

  /**
   * Delete a record by ID
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await db.delete(this.table).where(eq((this.table as any).id, id));
    return (result as any).rowCount > 0;
  }

  /**
   * Count records matching a condition
   */
  async count(condition?: SQL): Promise<number> {
    const result = condition
      ? await db.select().from(this.table as any).where(condition)
      : await db.select().from(this.table as any);
    return result.length;
  }
}
