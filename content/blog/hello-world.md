---
title: Hello, World
slug: hello-world
excerpt: I build database platforms and test software for a living. The question that follows me between those jobs is what happens on the second try.
publishedAt: '2026-06-10T00:00:00.000Z'
author: Bob Bass
type: other
seo:
  metaTitle: Hello, World — Bob Bass
  metaDescription: A field note from Bob Bass on building Layerbase, leading engineering at Efficient.app, and what a database platform owes the developer using it.
  noIndex: false
tags:
  - name: Platform engineering
    slug: platform-engineering
---

A database branch makes for a pretty good demo. You run a command, get a connection string, and there’s your data. The question I want to ask is what happens if my laptop loses Wi-Fi halfway through. When I run the command again, do I get the branch I already made? A second database? An invoice for both?

I’m Bob. I lead engineering at [Efficient.app](https://efficient.app "follow"), where we test software hands-on, and I’m the founder of [Layerbase](https://layerbase.com "follow"), where I get to be on the receiving end of questions like those. It’s a useful arrangement. Every time I catch myself thinking a setup step is obvious, I remember how often I’ve sat on the other side of that screen wondering which button somebody meant.

Layerbase grew out of wanting a disposable copy of Postgres on my laptop. Today I’m working on engine-agnostic database branching, agent sandboxes, and Next.js hosting. This site runs on Layerbase, too. If you’re reading this, at least one of my deployment decisions worked.

This is where I’ll write about the parts that get edited out of a product walkthrough. What counts as a consistent copy of a running database? What can an old request safely retry after a newer one has succeeded? Sometimes the best way I have to explain a design decision is to show you the bug that forced it.

*Updated November 24, 2026.* A good place to start is [I accidentally built a Supabase alternative](/blog/i-built-a-supabase-alternative), including the night my own dashboard politely invited me to create my first database.
