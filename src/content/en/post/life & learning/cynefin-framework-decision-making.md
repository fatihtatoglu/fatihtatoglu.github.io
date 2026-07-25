---
id: 2fjlbepycf
lang: en
title: "What Is Cynefin? Not Every Problem Is the Same Type"
slug: "cynefin-framework-decision-making"
category: technical-notes
schemaType: post
tags:
  - cynefin
  - cynefin-framework
  - decision-making
  - complex-systems
  - systems-thinking
  - complex-vs-complicated
  - software-teams
  - safe-to-fail-experiments
  - product-discovery
  - incident-response
readingTime: 23
date: 2026-07-11  
updated: 2026-07-25
pair: "cynefin-karar-verme-cercevesi"  
canonical: "~/en/cynefin-framework-decision-making"
alternate: "~/cynefin-karar-verme-cercevesi"
description: "Learn what the Cynefin framework is and how Clear, Complicated, Complex, and Chaotic contexts require different decision-making approaches."
keywords:
  - "what is cynefin"
  - "cynefin framework"
  - "decision making"
  - "complex systems"
  - "systems thinking"
  - "complex vs complicated"
  - "safe-to-fail experiments"
  - "software teams"
featured: false
cover: assets/images/cynefin-not-all-problems-are-the-same.webp
coverAlt: "A person at a crossroads looks toward signs representing goals, analysis, networks, crisis, and uncertainty."
coverCaption: "Not every problem is the same type; good decisions begin with understanding the context."
template: post
layout: default
status: published
extract: "What if the hardest part of solving a problem is not finding the answer, but recognising what kind of problem stands before us? Some situations reward standards, others demand expertise; some reveal themselves only through careful experiments, while crises leave no time for analysis at all. Cynefin offers a way to notice these differences before familiar methods lead us astray. Because the right decision rarely begins with 'What should we do?' It begins with a quieter, more unsettling question: 'Where are we, really?'"
aiTranslated: "ChatGPT 5.6 Sol High"
---

# What Is Cynefin? Not Every Problem Is the Same Type

Sometimes, the first mistake we make while trying to solve a problem is not in the solution itself. It may be in misunderstanding what kind of structure the problem has.

We may try to rediscover a problem we already know. We may run random experiments on a subject that requires expertise. We may spend months analysing a situation where we can only learn the outcome by trying. Or during a crisis, we may wait to find every answer instead of taking action.

The same way of making decisions does not work in every situation.

Cynefin is a sense-making framework that helps us think about exactly this distinction. It does not directly tell us, "Do this." First, it makes us ask a more basic question:

> What kind of situation are we in, and what is the appropriate way to make decisions in this situation?

This question matters. Approaching every problem with the same management mindset may cause us to use a method we know well in the wrong place.

## What Is Cynefin?

Cynefin is a sense-making and decision-making framework developed under the leadership of Dave Snowden. Its name comes from a Welsh word. It is difficult to translate with a single word; it suggests the context shaped by where a person is, their past, relationships, experiences, and sense of belonging.

The main purpose of Cynefin is to help us understand the nature of the situation we face and change our way of making decisions accordingly.

The model is sometimes described as a "system classification." This description is useful as a starting point, but it needs a small correction: Cynefin is not meant to place permanent labels on systems.

A company as a whole is not "Complex." A software project is not entirely "Complicated." A team does not always work in a "Clear" domain.

Cynefin is more concerned with understanding the nature of the situation we face at a particular moment. Different parts of the same product, the same project, or even the same problem may belong to different domains. For this reason, it is more useful to see Cynefin as a decision-making framework that helps us think according to context, rather than as a strict classification model.

### What are the Cynefin domains?

Cynefin defines five main domains for making sense of situations:

|Domain|Cause-and-effect relationship|Main approach|Type of practice|
|---|---|---|---|
|Clear|Clear and repeatable|Sense, categorise, respond|Best practice|
|Complicated|Exists, but is discovered through analysis|Sense, analyse, respond|Good practice|
|Complex|Cannot be reliably identified in advance|Probe, sense, respond|Emergent practice|
|Chaotic|There is no usable order yet|Act, sense, respond|Novel and situation-specific practice|
|Central domain (Confused / Aporetic)|It is not yet clear which approach is appropriate|First make sense of the situation|Decomposition, questioning, and discovery|

> **Terminology note:** Cynefin is a living framework that has evolved over time. The central domain was historically called _Disorder_. In later explanations, the terms _Confused_ and _Aporetic_ started to be used. The use of these concepts and the distinction between them may change across explanations from different periods of the framework.

The table should be seen as a way of thinking, not as a recipe. The real value of Cynefin does not come from knowing the names of the domains. It comes from recognising that different situations require different ways of making decisions.

## The Clear domain: Problems that can be standardised

In the Clear domain, what needs to be done is mostly known. Similar situations have happened before, outcomes are predictable, and a standard practice can be used repeatedly.

The decision cycle here is:

**Sense, categorise, respond (_Sense, Categorise, Respond_)**

- First, we sense the situation.
- We place it into a category we already know.
- Then we apply the response defined for that category.

In this domain, the idea of best practice is meaningful. The context is stable enough, and a method that has repeatedly produced good results can be standardised.

### An example from software

Imagine that a developer needs to set up the company's standard development environment.

The setup steps are documented:

1. Install the required runtime version.
2. Clone the code repository.
3. Define the environment variables.
4. Install the dependencies.
5. Run the tests.

If this process has been followed hundreds of times and produces the same result, there is no need to have a new architecture discussion for every developer. Standardisation is valuable here.

Other examples include:

- Code formatting rules.
- A known certificate renewal procedure.
- A standard process for granting user permissions.
- Repeated deployment checks.
- Resolving operational errors that were previously defined and whose root causes are known.

The purpose of this type of work is not to discover a new solution every time. It is to repeat a method that works well in a reliable way.

### The danger of the Clear domain

This domain may look easy, but that does not mean it is free of risk. Two of the biggest risks are overconfidence and becoming blind to change.

We may assume that a practice will remain correct forever because it has worked for a long time. A checklist may slowly turn into a mechanical ritual instead of serving its purpose. People may start following a procedure without thinking about why they are doing it.

For example, a deployment procedure that has worked for years may not have been updated after the system architecture changed. The team still follows the old checklist, but the system is no longer the system assumed by that checklist.

This is one reason why the boundary between the Clear and Chaotic domains is especially important in Cynefin. When we trust a long-running method too much, we may fail to notice changes in the environment. The system may look orderly up to a certain point, then suddenly go out of control because of accumulated weaknesses.

Standard processes should therefore not only be followed. From time to time, we also need to question whether the assumptions behind them are still valid.

> The fact that something has become standard does not mean it will remain standard forever.

## The Complicated domain: Problems that can be analysed

In the Complicated domain, there is a cause-and-effect relationship. However, unlike in the Clear domain, this relationship cannot be easily seen by everyone. It can be discovered with enough data, analysis, and expertise.

The decision cycle here is:

**Sense, analyse, respond (_Sense, Analyse, Respond_)**

- First, we gather information.
- Then we analyse it.
- We act according to what we have learned.

There does not have to be only one correct answer. There may be several good solutions. For this reason, this domain is associated with expertise and good practice.

The importance of expertise is not the only feature that defines this domain. Expert knowledge is also valuable in Complex situations. The main difference is that in the Complicated domain, the cause-and-effect relationship can be discovered through enough analysis.

### An example from software: Database performance

Imagine that some queries in an application have become slow. The source of the problem may be one or more of the following:

- A missing index.
- A poor query plan.
- A change in data distribution.
- Unnecessary table joins.
- An incorrect caching strategy.
- A disk or network bottleneck.

Instead of making random changes, we need measurement and analysis. An expert examines the query execution plan. They compare metrics. They check index usage. They evaluate the costs of alternative solutions.

There may be several valid solutions. Adding more indexes may speed up the query but increase the cost of writes. Using a cache may reduce the load but require new decisions about data consistency.

In other words, an answer exists. But it does not appear by itself.

### Other examples

- Technical analysis of which modules should be separated from a large monolith.
- Finding the source of a memory leak.
- Capacity planning for a high-traffic system.
- Designing a migration from one database technology to another.
- Root cause analysis of a security vulnerability.
- Evaluating architectural alternatives for specific performance targets.

Expertise is valuable in this kind of work. But there is also a risk here: treating expertise as absolute truth.

An expert uses their previous experience. This is very valuable. However, when the problem is no longer the same as past conditions, expertise can also create a false sense of certainty.

One distinction in Cynefin is especially important to me: For some problems, more analysis really does produce a better answer. For others, analysis is not enough to know the outcome in advance. This is why understanding the boundary between the Complicated and Complex domains is particularly important.

## What Is the Difference Between Complex and Complicated in Cynefin?

|Feature|Complicated|Complex|
|---|---|---|
|Cause and effect|Can be discovered through analysis|Cannot be reliably known in advance|
|Main method|Analyse|Run small experiments|
|Role of expertise|Helps reveal possible solutions|Helps design the experiments|
|Appropriate decision cycle|Sense, analyse, respond|Probe, sense, respond|

In a Complicated problem, a correct or good answer can be found through enough expertise and analysis. In a Complex problem, we can only learn which approach will work after interacting with the system. For this reason, doing more analysis does not automatically turn a Complex problem into a Complicated one.

## The Complex domain: Problems learned through experimentation

The Complex domain shows one of Cynefin's most important distinctions.

Cause-and-effect relationships are not completely absent here. However, it is difficult to predict them reliably in advance. Once the outcome has appeared, we can look back and give a logical explanation.

What happened may make sense afterwards. But that does not mean it could have been reliably predicted beforehand.

The decision cycle here is:

**Probe, sense, respond (_Probe, Sense, Respond_)**

- First, we run small and controlled experiments.
- Then we observe how the system responds.
- We strengthen the patterns that work.
- We limit or stop those that produce negative outcomes.

The key difference is this:

> You cannot turn a Complex problem into a Complicated problem simply by doing more analysis.

The system may change as you interact with it.

### An example from software: A new product feature

Imagine that a team is developing a new feature to increase knowledge sharing between users in a team. The team is looking for an answer to this question:

> How will users use this feature?

It is difficult to find a definite answer to this question in a meeting room.

- User research can be conducted.
- Expert opinions can be collected.
- Similar products can be studied.

All of these are valuable. However, real user behaviour only appears after the user and the product begin interacting.

Instead of building one large six-month solution, the team can design several small experiments:

- Releasing a simple prototype to a limited group of users.
- Trying different interaction models.
- Observing usage behaviour.
- Studying unexpected ways of using the feature.
- Measuring the effect of small changes.

The goal is not to find the correct answer in the first experiment.

**The goal is to produce information from the system.**

### Safe-to-fail experiments

In the Complex domain, interventions should be designed to be small, limited, and able to produce feedback. This approach is described as safe-to-fail experiments or probes.

When an experiment fails, it should not put the entire system at risk. For example, instead of forcing a new onboarding flow on every user at once, it is safer to test it with a small group. If an unexpected problem appears, its area of impact remains limited. The team can also continue learning.

Where possible, running several small and parallel experiments that test different assumptions is more valuable than running one large experiment. This allows us to compare how the system responds to different interventions instead of committing too early to a single idea.

Failure here is not only a loss. When it happens within the right boundaries, it produces information.

### Other examples of the Complex domain

- The behaviour of a new product in the market.
- Users' reactions to a new feature.
- Changing the team structure in an organisation.
- Improving the way many independent teams work together.
- Behavioural changes in company culture.
- How a new technology will be adopted within an organisation.

The common feature of these examples is that they contain many interacting elements. As human behaviour, feedback loops, and changing conditions become involved, our ability to predict decreases.

In this domain, the solution is often not fully designed at the beginning. It appears and takes shape through interaction with the system. For this reason, the idea of emergent practice is more meaningful here.

## The Chaotic domain: Stabilise the system first

In the Chaotic domain, waiting for analysis may be dangerous. The system changes so quickly and irregularly that it is not possible to establish a usable cause-and-effect relationship.

The priority is not to find the correct answer. It is to prevent further harm and create room to act again.

The decision cycle here is:

**Act, sense, respond (_Act, Sense, Respond_)**

- First, we act.
- Then we observe the situation that appears.
- After that, we make more informed decisions.

### An example from software: A major production outage

Imagine that a payment system suddenly crashes. The error rate is rising quickly. Queues are growing. Some transactions may be running twice. Customer transactions are being affected.

The first thing to do at this moment is not to hold a three-hour root cause analysis meeting.

First, the system needs to be stabilised. For example:

- Roll back the new release that appears to be causing the problem.
- Limit part of the traffic.
- Temporarily disable the problematic integration.
- Put the system into read-only mode.
- Stop certain transactions to prevent data loss.

These interventions may not be the final solution. The goal is to reduce the chaos first and make the system observable again.

Once control is restored, the situation may move into another domain. For example, a production outage that was initially Chaotic may become a Complicated problem after the system is stabilised. Experts can then examine the logs, investigate the root cause, and design a permanent solution.

### The important difference of the Chaotic domain

- Chaos is not a way of working.
- Constantly putting out fires is not a sign of agility or speed.
- A Chaotic situation is usually temporary.
- The goal is to create enough boundaries and order to make the situation understandable again.

## Cynefin's central domain: Confused and Aporetic

The terminology of the central domain in Cynefin has changed as the framework developed. Historically, this domain was called _Disorder_. In later explanations, the concepts of _Confused_ and _Aporetic_ became more common.

Instead of seeing these concepts as exact synonyms, it is more useful to understand the difference between them.

In a **Confused** state, we cannot yet distinguish which domain's decision logic is appropriate. The problem may not have been separated into smaller parts, or problems with different characteristics may have been grouped under one title.

In an **Aporetic** state, we are aware that we do not know. Being able to say "I don't know" for a while, without allowing existing categories or assumptions to lead us towards an early answer, may be a conscious starting point for seeing new possibilities.

This distinction may look theoretical at first. In practice, however, it is very valuable.

### An example from software

Imagine that a team faces the following statement:

> The system is slow. We need to fix the performance.

This single sentence may actually include problems from different domains:

- If there is a known misconfiguration, it may be Clear.
- If experts need to examine the database queries, it may be Complicated.
- If we do not know which delays users truly see as a problem or how their behaviour will change, it may be Complex.
- If the system is currently completely unavailable, it may be Chaotic.

If the team starts producing solutions without making this distinction, everyone will use the method they are most familiar with.

- A developer looks for technical optimisations.
- The product manager creates a new prioritisation.
- The operations team increases capacity.
- A manager asks for a more detailed plan.

But there is still no shared definition of the problem.

Cynefin's central domain reminds us of something important:

> Sometimes our first task is not to solve the problem, but to understand what kind of problem we are facing.

## The same software project may exist in several domains

One common mistake when using Cynefin is giving the whole project a single label.

For example:

> This project is Complex.

This statement is usually too general.

Imagine that we are developing an e-commerce platform. The same project may contain all of the following:

|Work|Likely domain|Reason|
|---|---|---|
|Setting up a standard continuous integration pipeline|Clear|A known and repeatable process|
|Designing database scaling|Complicated|Requires technical analysis and expertise|
|The effect of a new loyalty model on user behaviour|Complex|The outcome appears through user interaction|
|A major production outage|Chaotic|Rapid stabilisation is needed first|
|An unclear problem such as "the payment screen works badly"|Central domain|The nature of the problem must first be separated and understood|

This perspective leads to an important result:

> It is more useful to classify the situation in which we are making a decision, not the project itself.

This allows us to choose an approach that fits the context instead of forcing the same process onto every type of work.

## What happens when we make decisions in the wrong domain?

The value of Cynefin is not limited to defining the domains. Its real value is helping us see the problems that appear when we use the wrong way of making decisions in the wrong domain.

A mismatch between the context and the decision-making approach we use can be described as _domain dissonance_.

### Treating a Complex problem as Complicated

This is common in software organisations.

There is an uncertain product problem. The team believes that doing more analysis will help them find the correct answer.

More reports are prepared. More detailed plans are made. More estimates are requested.

However, the problem may not come from a lack of analysis. Its structure may be such that we can only learn the outcome through interaction.

In this situation, more analysis does not produce certainty.

**It may only produce the feeling of certainty.**

I think this distinction is often misunderstood in the software world, especially in product problems. Because we are used to solving technical problems, we may assume that we can also find the correct answer in advance for subjects such as user behaviour or organisational dynamics, as long as we analyse them enough.

Sometimes, however, the path to learning is not analysis. It is controlled interaction.

### Treating a Complicated problem as Complex

The opposite is also possible. Turning everything into an experiment is not good.

For example, when a reliable encryption standard already exists, every team should not try to discover a new solution by experimenting with its own encryption method.

Where expertise and known engineering knowledge exist, we need to use them.

Complexity thinking does not say that everything is uncertain. Some problems can truly be analysed. Some can truly be standardised.

### Making a Clear problem bigger than necessary

Some teams may create unnecessary meetings, analyses, and decision processes to solve a simple task.

Making the same decision again and again for known, repeated work is a waste of energy. Standardising work that can be standardised allows us to save our mental capacity for problems that are genuinely uncertain.

### Trying to analyse a Chaotic problem

One of the biggest mistakes during a crisis is waiting for complete information before taking action.

When a production system has crashed, trying to understand every cause first may allow the damage to grow.

First, we need to create a safe boundary. Analysis comes later.

## Why does best practice not work everywhere?

The idea of "best practice" sounds reassuring. Someone has tried it before, achieved a result, and we assume that using the same method will give us a similar result.

This approach is very valuable in the Clear domain.

In the Complex domain, however, when we copy a method that worked in another organisation, we can carry the method itself, but we cannot carry the relationships, history, and conditions that made it successful in exactly the same way.

The success of a practice does not come only from the practice itself. People, organisational structure, past decisions, market conditions, and feedback loops also shape the outcome.

For this reason, from a Cynefin perspective, the question:

> Which practice is best?

comes after this question:

> What context are we in?

Best practices are valuable in the Clear domain. In the Complicated domain, good practices developed by experts become more important. In the Complex domain, the solution often appears through experiments and feedback.

The issue is not whether a practice is absolutely good or bad.

The issue is whether it is appropriate for our context.

## Moving between Cynefin domains

We should not think of the domains as fixed boxes. Over time, a situation may move from one domain to another, or some parts of it may become more suitable for a different decision logic.

For example, a new product feature may be Complex in its early stage. User behaviour is observed, different experiments are run, and some patterns begin to appear.

Over time, some of these patterns may become better understood. Certain decisions may turn into expert knowledge. Some practices that become stable and repeatable enough may be standardised.

This does not mean that every problem must follow a linear path such as:

> Complex -> Complicated -> Clear

It simply shows that some relationships that are uncertain today may become understandable over time.

In the same way, a major production outage may begin as Chaotic. The system is stabilised. The problem is limited. It may then turn into a situation that experts can analyse.

The opposite is also possible. A process that has been accepted as Clear for a long time may no longer show the same level of predictability when the conditions around it change.

This movement reminds us that:

> The way of making decisions that was correct yesterday may not be correct today.

When the context changes, the approach must also change.

## How can software teams use Cynefin?

Using Cynefin does not require a large organisation-wide transformation programme.

It can be used even in a planning, problem-solving, or decision-making meeting.

### 1. Make the problem smaller first

Do not try to place a large title such as "new platform project" into a single domain.

Instead, separate the concrete decisions or problems:

- How will the authentication infrastructure be set up?
- Will users adopt the new flow?
- What will the data migration strategy be?
- How will we stop the current production error?

Large problems are often combinations of smaller problems with different characteristics.

### 2. Question the cause-and-effect relationship

Ask:

> Can we find the correct answer in advance if we analyse this problem enough?

If the answer is clearly yes, the problem may be Clear or Complicated.

If the answer is:

> We can only understand it after trying and seeing how the system or users respond.

then it is likely to be Complex.

If the answer is:

> We do not have time to analyse it right now. We need to stop the damage first.

then we may be in the Chaotic domain.

If we cannot even clearly explain what the problem is or which decision logic is appropriate, we may need to stay in the central domain first and separate the problem into parts.

### 3. Choose the decision method according to the domain

- If it is Clear, standardise it.
- If it is Complicated, use analysis and expertise.
- If it is Complex, run small and controlled experiments that test different assumptions where possible.
- If it is Chaotic, stabilise the system first and create room to act.
- If you do not know which domain you are in, separate the problem and question your assumptions before forcing a solution.

### 4. Check again whether the domain has changed

Do not classify a problem once and then forget about it.

The situation may change as new information arrives. Some relationships that were previously uncertain may become understandable over time. A standard process may become uncertain again because the surrounding system has changed.

Cynefin is not a one-time classification tool. It is a way of thinking that can be used repeatedly.

## Conclusion: The right context before the right solution

In engineering, we like finding good solutions.

- A better architecture.
- A better process.
- A better tool.
- A better practice.

But Cynefin reminds us of something more basic:

> The quality of a solution depends not only on the solution itself, but also on the context in which it is applied.

Constantly rediscovering work that should be standardised is inefficient.

Trying to solve a problem that requires expertise through random experiments is risky.

Trying to control a Complex system completely through detailed plans may create false certainty.

Waiting for analysis during a crisis may allow the damage to grow.

For this reason, when we begin working on a problem, our first question should not always be:

> Which method is best?

It is more valuable to ask first:

> What kind of situation are we in right now?

As the answer to this question changes, the form of a good decision also changes.

This is one of Cynefin's most valuable lessons:

**Not every problem is the same type.**

So we do not have to approach every problem in the same way.

## Sources

- Cynthia F. Kurtz and David J. Snowden, _[The New Dynamics of Strategy](https://doi.org/10.1147/sj.423.0462): Sense-making in a Complex and Complicated World_, IBM Systems Journal, 42(3), 462-483, 2003.
- Dave Snowden and Mary E. Boone, ["A Leader's Framework for Decision Making"](https://hbr.org/2007/11/a-leaders-framework-for-decision-making), Harvard Business Review, 2007.
- The Cynefin Co, ["The Cynefin Framework"](https://thecynefin.co/about-us/about-cynefin-framework/).
- The Cynefin Co, ["Effective Decision Making Support Tool"](https://thecynefin.co/effective-decision-making-support-tool/).
