---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-03-22T00:00:00.000Z
permalink: ./en/projects/turboc-blog-theme.html
language: en

description: When I first started programming, there was only Turbo C/C++ I could use. In this article, I'll be talking about the site theme I created based on Turbo C/C++.
tags: turboc turbocpp site_theme borland sass mustache gulp nodejs normalizecss github_actions github_pages
category: projects
---

# Turbo C/C++ Theme

![Turbo C/C++](../image/turboc_0001.png "Turbo C/C++")

It is a theme I've developed based on the legendary Turbo C/C++ program faced by developers who started to program before 2000. This theme uses in the current website you are reading now.

## Motivation

When I was a child, my leisure activity was reading computer magazines and playing demo games on the CD from those magazines. One day, I found a booklet with one of them, **C Programming Language**. In that booklet, it explained basically. I read it in a short time, and I wanted to try it. There was a program called Turbo C, and I could practice with it was written in the booklet. However, there was nowhere. During surfing the internet, I found it. I downloaded a zip file with notes prepared by a team that introduced themselves as hackers. It also had a Turbo C in it. I read notes first and then started experimenting.

Starting programming with a booklet was during my high school years. Even after I started programming, I couldn't leave.

I wanted a theme of plain, nerd work and showing that I didn't forget the development environment when I started. I couldn't find anything according to my wants. In the end, I decided to develop myself, but inside of using ready things, I preferred to get my hands dirty.

## Challenges

![Turbo C/C++](../image/turboc_0002.png "Turbo C/C++")

In my thought, the significant challenge was giving a similar user experience to the users who had used Turbo C/C++ before. The user experience is different between developed as a desktop application and a website. Nevertheless, I believed I could achieve it, and I started to work.

When I started development, my first thought was to move forward with **HTML5** and **CSS3**. But then I wanted to include **SASS**.

I am a back-end developer. I rarely develop front-end applications. Another challenge of this project was creating a structure that the other front-end developers would accept.

After completing the development, this project had to be shared somehow. I used the **Gulp** automation library that I've used before, and the **GitHub Actions** has published it on the **GitHub Pages**.

Usually, there will be security vulnerabilities, code smells, and improvements during the development. I've used **GitHub CodeQL** and **Sonar Cloud** for tracking these.

![SASS, normalize.css, Gulp, NodeJS, Mustache, GitHub Actions, GitHub Pages, Sonar Cloud](../image/turboc_tech.png "Proje için kullanılan teknolojiler")

## Theme Properties

I didn't want the theme to be plain. I also wanted to add some additional features. I continue to develop it, but there are the current features in the below list.

- Responsive design
- Four different colors
  - Aqua
  - Blue
  - Black
  - White
- The suitable color pallet for Turbo C/C++ environment is 8-bits
- The elements of the theme
  - Typography
  - Button
  - Textbox
  - Textarea
  - Checkbox
  - Radio Button
  - Selectbox
  - Table
  - Form
  - Dialog
  - Menu (Navigation Bar)
  - Notification Boxes

I developed the theme for myself, but I made it available to everyone under the [MIT](https://github.com/fatihtatoglu/blog-theme-turboc/blob/master/LICENSE "MIT License of the Project") license. If you want to use it yourself, you can visit the theme's [GitHub](https://github.com/fatihtatoglu/blog-theme-turboc "GitHub Address of the Project") repo. If you want to support me, you can give a star to the repo, open the bugs you find on the demo site as an issue, or submit your new feature requests as an issue.

## References

1. [CSS Architecture — Part 1 - Normalize CSS or CSS Reset?!](https://elad.medium.com/normalize-css-or-css-reset-9d75175c5d1e "CSS Architecture — Part 1 - Normalize CSS or CSS Reset?!")
2. [normalize.css](https://necolas.github.io/normalize.css/ "normalize.css")
3. [Sass : @function, @mixin, placeholder, @extend](https://dev.to/keinchy/sass--function-mixin-placeholder-extend-18g6 "Sass : @function, @mixin, placeholder, @extend")
