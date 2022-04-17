---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-04-08T00:00:00.000Z
permalink: ./en/projects/gulp-html-anchor-rewriter.html
language: en

description: A gulp plugin has been developed by me and what I have learned while developing.
tags: enginaer gulp mocha chai plugin
category: projects
---

# Gulp HTML Anchor Rewriter

I realized that I had a rare need for SEO while creating my site with the enginær site engine. So I developed a gulp plugin for myself. With this plugin, it is possible to add **rel** and **target** to **a** elements in an HTML file.

## Motivation

While developing Enginær, an issue related to SEO never crossed my mind. When using it on my site, I remember how important SEO is. I found a gulp plugin and created the sitemap.xml file. I made link adjustments by customizing Enginær's templates, but in the end, I determined that outgoing links from the site were not **rel** links, and I needed to add the **target** feature to prevent these links opened inside of the side. But I couldn't find a plugin that does this.

When I couldn't find the plugin I was looking for, a voice in my mind told me it might be fun to develop it myself. This time I wanted to follow this voice and start developing. My goal is to add **rel** and **target** attributes to some **a** elements in an HTML file.

## Challenges

![NodeJS, Mocha, Chai, GitHub Actions, SonarCloud](../image/gulp-html-anchor-rewriter_tech.png "Technologies used for the project")

I had only experience developing gulp plugins with Enginær before. Since this project will be a little easier, I thought I should make a challenge for myself and started researching how to write a gulp plugin. I found helpful documentation on Gulp's GitHub. I realized that I could write a great plugin by following this document.

It was stated in the document that the plugins might test. I kept on because this was a new challenge for me that I've never written a unit test for either NodeJS or JavaScript. I found the **Mocha** and **Chai** libraries in my research, and after researching them a bit, I decided that they were so easy and continued. I've developed the plugin and made a few improvements. After that, I wondered about the code coverage ratio of the project as in the others I added unit tests. I achieved this with **IstanbulJS**.

I decided that I should make one more addition after the project was simple and progressed quickly. Since I finished the project, I thought it would be informational to add a CI/CD structure and an integrated static code analysis to it. I chose **SonarCloud** for the project since **SonarQube** was the first thing that came to mind when I said static code analysis. When the pipeline I created with **GitHub Actions** was automatically integrated into **SonarCloud**, I got it done at lightning speed.

After a few scans, I saw that the calculated code coverage ratios ​​were not flowing to **SonarCloud**. After some research, I solved this problem with manual processing from **GitHub Actions** instead of automatic.

Finally, I started with a rare need, but what I learned and the experience I gained is precious. I will continue to do projects like this and push myself.

I published the project under the license of [MIT](https://github.com/fatihtatoglu/gulp-html-anchor-rewriter/blob/master/LICENSE, "MIT License of the Project") for everyone to use. For ease of access, I made it available to everyone via [NPM](https://www.npmjs.com/package/gulp-html-anchor-rewriter "Project's NPM address"). You can use it as you want. If you wanna support or contribute, you can visit the project's [GitHub](https://github.com/fatihtatoglu/gulp-html-anchor-rewriter "GitHub Address of the Project") and leave a star. I also ask you to enter the problems during use as an issue.

## References

1. [Writing a Gulp Plugin](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md "Writing a Gulp Plugin")
2. [Scan your code with SonarCloud](https://github.com/SonarSource/sonarcloud-github-action "Scan your code with SonarCloud")
3. [SonarCloud HowTo](https://asus-aics.github.io/DeveloperGuide/pages/020_sonar_cloud/ "SonarCloud HowTo")
