---
id: sqbhqjk89b
lang: en
title: "SHEVKY: A Minimal Static Site Generator for Writing"
slug: shevky-static-site-generator
category: "technical-notes"
tags:
  - static-site-generator
  - markdown
  - developer-blogging
  - writing-workflow
  - minimal-tools
  - ssg
  - open-source
  - nodejs
  - writing-tools
  - publishing-workflow
readingTime: 4
date: 2025-12-12
updated: 2025-12-13
pair: "shevky-minimal-statik-site-uretici"
canonical: ~/en/shevky-static-site-generator/
alternate: ~/shevky-minimal-statik-site-uretici/
description: "SHEVKY is a minimal static site generator that removes friction from writing and helps developers publish with Markdown and HTML."
keywords:
  - static site generator
  - writing workflow
  - markdown ssg
  - developer blogging
featured: false                       
draft: false
cover: "/assets/images/shevky-cover.webp"
coverAlt: "Minimal static site generator workflow focused on writing"
coverCaption: "SHEVKY focuses on removing friction, not adding features."
template: "post"                     
layout: "default"                    
status: "published" 
---
# SHEVKY: A Minimal Static Site Generator for Writing

This is not a post about a tool. It's about removing friction from writing.

For a long time, I tried to build a blog, but I could never find a rhythm or a sustainable pace to keep writing. I tried WordPress, Medium, LinkedIn, etc. However, I couldn't succeed. Every time, I told myself this would be the right moment. It never was. One of my friends once told me: _"You clearly want to share something. It doesn't have to be perfect - neither the design nor the engine."_

For a while, I worked on my own static site generator called **Enginær**, built with Node.js on top of a Gulp pipeline. It came from the same motivation: creating a place to write. Though I didn't update or fix the bugs for about 3 years.

After completing some outsourced projects and working for a start-up, I realized that a CMS (content management system) is often a necessary tool - especially for landing pages and semi-dynamic web apps. When I combined that necessity and my passion for creating a blog, I developed **SHEVKY** with my learnings from **Enginær**.

## What Is SHEVKY?

![SHEVKY Process Flow](/assets/images/shevky-process-flow.webp)

**SHEVKY** is a simple and lightweight static site generator. Like many others, it converts Markdown files into plain HTML. On the other hand, **SHEVKY** is not an attempt to reinvent static site generators. It's not trying to be faster, smarter, or more popular than existing tools. It is a simple engine designed to remove friction. To stop waiting for the perfect setup. To stop aligning everything before starting. SHEVKY exists to remove the excuses we hide behind. At least, it removed mine.

From this point on, everything is intentionally boring.

## Installation

**SHEVKY** is a CLI tool to initialize and build the website from scratch.

```bash
npm install --save-dev shevky
```

The above command is enough to install it. The usage continues with the `npx shevky` command.

## Usage

It can be used like other CLI tools from the terminal. The only prerequisite is **Node.js v20**, which is already supported by most cloud providers and CI/CD pipelines.

### Initialization

To start simply, I prefer to initialize the project with the following command.

```bash
npx shevky --init
```

This command creates the necessary folders and files for a simple demo website.

![SHEVKY Folder Structure](/assets/images/shevky-folder-structure.webp)

For now, **SHEVKY** is dependent on some structural assumptions, such as folder structure and template mechanism. On the other hand, these can be changed in the future. The important thing is completing the MVP scope.

### Build

After completing the content editing, the following command prepares the output as a static HTML website.

```bash
npx shevky --build
```

It generates the HTML website into the `dist` folder. Then it can be deployed to any static hosting structure, such as S3, GitHub Pages, AWS Amplify, etc.

### While Writing or Developing

While writing or developing, I added two flags to simplify the workflow: `--watch` and `--dev`. The `--dev` flag already includes `--watch`, so any change triggers an automatic rebuild.

## Features

Once friction is removed, the rest becomes secondary. Features exist only to support the act of writing - nothing more.

**SHEVKY** is a simple SSG, although it provides some necessary features. Despite being intentionally simple, it covers the essentials I personally need from an SSG.

- RSS Generation
- Multi-Language Support
- Sitemap Generation
- Atom Feeds
- Mustache-powered Template System
- Collection Generation
- Series Generation
- Social Sharing Generation
- Open Graph Ready Headers
- SEO friendly Headers
- Code Highlighting

The engine generates the above contents if the required information is provided. Also, some of these features can be toggled via feature flags.

On the other hand, I am planning to add some content providing features like reading content from an API and generating the site as static HTML.

## Why another static site generator?

At some point, the question stopped being "what does it support?" and became "why does it exist at all?". Honestly, because most of them were either too complicated for my needs or too abstract for how I like to think.

## Who can use SHEVKY?

The short answer: people with a programming background. Because it requires some technical context. **SHEVKY** is preconceived by design - and I'm okay with that.

I prepared a detailed technical documentation in the GitHub repository of the **SHEVKY**. You can find the technical details, documentation, and some samples.

If you are curious about how **SHEVKY** works under the hood, the technical documentation lives in the GitHub repository. It covers the structure, configuration, and design decisions in detail.

**SHEVKY** is not about building websites. It's about removing excuses - and finally starting.

## Related Links

- [Enginær GitHub Repository](https://github.com/fatihtatoglu/enginaer)
- [SHEVKY GitHub Repository](https://github.com/fatihtatoglu/shevky)
