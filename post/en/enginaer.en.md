---
layout: post
author: Fatih Tatoğlu
published: true
date: 2022-03-24T00:00:00.000Z
permalink: ./en/projects/enginaer.html
language: en

description: I will try to explain the purpose of the Enginaer site engine project and the source of motivation behind it.
tags: enginaer static_website_engine gulp nodejs automation markdown mustache markedjs
category: projects
---

# Enginær

The project that I wanted to do in 2012 and for which I said the following bold words. I've remembered it again, but this time I can find the motivation to complete it.

> **What is Enginær?**
>
> It's nothing new. WordPress, blogger, and similar services have been used for years. It is a system developed as an alternative to these.
>
> If you want to make a site for yourself or your business and you don't want to deal with it, you can use Enginær. Ease of installation and use, customization the way you want, and many more features will be yours with Enginær.
>
> All you have to do is decide on the website where you will install the Enginær system.

## Motivation

Writing a blog and sharing what I know is one of the things that I always wanted to do but could not achieve much. This time I chose a very different way to start over. I wanted to choose a way that can be called ***poor man's solution*** unlike the usual blog systems before.

I dreamed that what I wrote on a static page was published, and this process was done with an engineering-smelling process. Instead of looking for a structure that could do this, I thought it would be funnier to get my hands dirty and write it myself. I set out with this motivation, but I tried not to forget that it would be good to support the big words I said in 2012.

As a result, I can say that I am happy with the product I produced, even if it was a completely different product than I had imagined in 2012.

## Challenges

The hardest part of blogging is keeping it sustainable. When I thought about continuity, I realized that I spent the most time writing the article. Identify the topics of the articles, research, detail the research, and then summarize the subject in your sentences. The process is long, but this part is also the most fun part.

Apart from writing; setting the theme, editing the appearance of the pages, or searching for plugins for minor additions to the pages. While I was thinking about how easily I could do that, I could establish a structure that would enable this part to be created with templates.

![Gulp, Markdown, MarkedJS, Mustache, NodeJS, GitHub Actions, Glob, Sonar Cloud](../image/enginaer_tech.png "Technologies used for the project")

In addition, the system had to be set up very simply and could operate without the need for any further adjustments. Like other software projects, its release with the CI/CD pipeline would also provide the engineering touch I was looking for.

While thinking about the project, I realized that I was very uneasy. So I created a list of objectives to guide me as follows. Behind creating this list, I have clarified in my mind what I should focus on and what kind of system I should set up.

1. It should be easily adjustable. It should not require very complex settings or rules.
2. It should be quick and easy to use after setting it up.
3. Posts or entries must be markdown.
4. HTML outputs should be interchangeable with templates.
5. The system must be gulp compatible. In this way, additional updates or operations can perform on HTML files after generation.

## How It Works

Enginær is a static site engine that is easy to set up, and once you set it up, you can publish it by simply adding your articles. That was the structure I wanted to provide from the very beginning, and by ensuring that this site is standing now, I am proving to myself and you that this structure works.

The system works by doing some simple steps in order. These steps are;

- We provide the paths where the templates, pages, messages, page plugins, and theme helpers are needed by the system as configuration.
- Uploading the resources specified in the configuration files to the system.
- As the last step, creating static pages for the system to do its job.

The system creates a static web page using the metadata information on the pages. However, it is not saving the pages. The biggest reason for this is that it allows customizing the HTML files with different gulp plugins. For example, compressing the outputs or disabling the client cache by adding the version number to the end of the CSS and JavaScript files, etc.

## Support

I shared the project with [MIT](https://github.com/fatihtatoglu/enginaer/blob/master/LICENSE) license for everyone to use. The project is also in use as [NPM](https://www.npmjs.com/package/enginaer). Your support is significant as I continue to develop the project. Because of this, I'm waiting for your help on the project's [GitHub](https://github.com/fatihtatoglu/enginaer/) address. If you take the time to test it and report the bugs as an issue, it will make me even happier.

## References

1. [Web Archive - enginar.in 2012](https://web.archive.org/web/20120520021450/http://enginar.in/ "Web Archive - enginar.in 2012")
2. [Writing a Gulp Plugin](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md "Writing a Gulp Plugin")
3. [Glob](https://github.com/isaacs/node-glob "Glob")
