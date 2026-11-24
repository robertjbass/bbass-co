---
title: What does it mean to branch a database that isn’t Postgres?
slug: branching-beyond-postgres
author: Bob Bass
published: false
type: deep-dive
excerpt: A Postgres preview needs rows. A Redis preview might need a key with thirty seconds left to live. What should the same branch command promise both developers?
---

```bash
lbase branch staging search-preview
```

That’s the local Layerbase CLI command I want a developer to remember. Give it a database you already run locally and a name for the copy. You can try a migration, break it, and throw the copy away. The next person using staging should never notice your changes.

## What gets copied?

Take a Postgres database with an orders table and a Redis database with a shopping cart. For Postgres, a useful branch can start the server, open the table, and read the same orders. For Redis, a useful branch also needs to know whether that cart expires. Copying its current value into a new key would silently change the behavior of the application.

Layerbase’s local branching workflow works below both of those interfaces. The CLI briefly stops the source to capture consistent files, clones the data directory, and starts the branch on its own port. On a filesystem that supports copy-on-write, the two directories initially share disk blocks. An update in the preview gets its own blocks. Where filesystem cloning is unavailable, the CLI has to copy the files.

## The part the command can’t hide

Suppose a Redis key expires at noon. Branch at 11:59:50 and open the preview fifteen seconds later. Redis stores expiry times as absolute timestamps. The key can already be gone when the branch starts, even if nobody touched the parent. Meanwhile, the order row in the Postgres example is still there.

That distinction shapes how I think about preview environments. I want one operation for getting an independent database. I also want the preview to preserve the behavior my application will encounter when it ships. For a checkout test that needs a live cart, I’d seed a fresh cart when the test starts. Making the branch secretly extend every expiration would make the test pass for the wrong reason.

[Layerbase CLI documentation](https://layerbase.com/docs/cli "follow") · [How Redis stores expiration times](https://redis.io/docs/latest/commands/expire/#expires-and-persistence "follow")
