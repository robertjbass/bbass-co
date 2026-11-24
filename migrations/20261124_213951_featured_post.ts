import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "blog" ADD COLUMN "featured" boolean DEFAULT false;
   CREATE UNIQUE INDEX "blog_one_featured" ON "blog" ("featured") WHERE "featured" IS TRUE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "blog" DROP COLUMN "featured";`)
}
