---
layout: post
published: false
author: Fatih Tatoğlu
date: 2022-04-08T00:00:00.000Z
permalink: ./en/projects/gulp-html-anchor-rewriter.html
language: en

description: A gulp plugin has been developed by me and what I have learned while developing.
tags: enginaer gulp mocha chai plugin
category: projects
---

# Gulp HTML Anchor Rewriter

After developing Enginaer, I realized that SEO was missing. With this plugin I edit the **rel** and **target** attributes of HTML anchor elements.

## Motivation

SEO is important for personal websites. A lack of SEO will result in the website not being visited by enough visitors. Before using Enginaer for my personal website, I could not imagine this. Eventually, I was in want of rewriting an anchor element for SEO.

Normally, I could add a piece of code to correct the SEO. But this time, I preferred to get my hands dirty.

First, I needed to know how to develop a Gulp plugin. Next, I created a build pipeline with static code analysis. Finally, I used it for my website.

The development of this plugin was very instructive for me.

## Challenges

![NodeJS, Mocha, Chai, GitHub Actions, SonarCloud](../image/gulp-html-anchor-rewriter_tech.png "Technologies used for the project")

I have never developed a Gulp plugin before. After reading the plugin documentation, I was excited. The unit tests for the Gulp plugins are mandatory. So, if the unit test is not optional, I will have an opportunity to develop it with Test Driven Development.

In summary, While I started solving my own problem, the result was a Gulp plugin for everyone, which is available as open-source.

## Support

I have made the project available with an [MIT](https://github.com/fatihtatoglu/gulp-html-anchor-rewriter/blob/master/LICENSE) license for anyone to use. The project can also be used as an [NPM](https://www.npmjs.com/package/gulp-html-anchor-rewriter) package. To use and support it, you can visit the project's [GitHub](https://github.com/fatihtatoglu/gulp-html-anchor-rewriter) repository.
