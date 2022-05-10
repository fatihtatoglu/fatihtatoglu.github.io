---
layout: post
author: Fatih Tatoğlu
published: false
date: 2022-03-24T00:00:00.000Z
permalink: ./en/projects/enginaer.html
language: en

description: I will try to explain the purpose of the Enginaer site engine project and the source of motivation behind it.
tags: enginaer static_website_engine gulp nodejs automation markdown mustache markedjs
category: projects
---

# Enginær

Enginær is a simple static website generation engine. Also, it was a project that I could not complete in [2012](https://web.archive.org/web/20120626234836/http://enginar.in/ "Web Archive - Enginær") with the same name and purpose.

## Motivation

As a software developer, I use an IDE more than regular programs. During the development, usually, I execute a command in the command prompt. If the result is as expected, I push changes to the remote code repositories.

The biggest motivation behind the decision to code this project is to keep the same user experience while developing an application.

## Challenges

Apart from the technical side, creating a static website is more complicated than thought. Moreover, adding additional features can turn the project into an unattainable goal.

Technically, another challenge is to stay as simple as possible. The engine must be customizable, compatible, simple and extensible. To ensure compatibility, the engine was developed as a Gulp plugin. For customization, the engine includes a template system. In addition, it has templates and page plugins. For simplicity, the required resources must be a Markdown file with basic metadata information. To ensure extensibility, the output of the engine is not saved. Thus, the other Gulp plugins can be run after the engine completes the processes.

![Gulp, Markdown, MarkedJS, Mustache, NodeJS, GitHub Actions, Glob, Sonar Cloud](../image/enginaer_tech.png "Project Libraries & Technologies")

## Support

I have made the project available with an [MIT](https://github.com/fatihtatoglu/enginaer/blob/master/LICENSE) license for anyone to use. The project can also be used as an [NPM](https://www.npmjs.com/package/enginaer) package. Your support is important as I would like to develop the project further. To use and support it, you can visit the project's [GitHub](https://github.com/fatihtatoglu/enginaer/) repository.
