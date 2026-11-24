import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "blog_post_tags" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "slug" varchar NOT NULL
  );

  ALTER TABLE "blog" ADD COLUMN "markdown_body" varchar;
  ALTER TABLE "blog" ADD COLUMN "author" varchar DEFAULT 'Bob Bass';
  ALTER TABLE "blog" ADD COLUMN "published" boolean;
  ALTER TABLE "blog" ADD COLUMN "suppress_file_fallback" boolean;
  ALTER TABLE "blog" ADD COLUMN "imported_cover_url" varchar;
  ALTER TABLE "blog" ADD COLUMN "imported_share_url" varchar;
  ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "blog_post_tags_order_idx" ON "blog_post_tags" USING btree ("_order");
  CREATE INDEX "blog_post_tags_parent_id_idx" ON "blog_post_tags" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "blog_post_tags" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "blog_post_tags" CASCADE;
  ALTER TABLE "blog" DROP COLUMN "markdown_body";
  ALTER TABLE "blog" DROP COLUMN "author";
  ALTER TABLE "blog" DROP COLUMN "published";
  ALTER TABLE "blog" DROP COLUMN "suppress_file_fallback";
  ALTER TABLE "blog" DROP COLUMN "imported_cover_url";
  ALTER TABLE "blog" DROP COLUMN "imported_share_url";`)
}
