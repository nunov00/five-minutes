---
title: Why a Nearly Full System Makes You Wait
description: "When arrivals and service times vary, the last bit of spare capacity does far more than its percentage suggests: it clears the small backlogs that randomness keeps creating."
takeaway: A variable service system needs spare capacity because it uses quiet moments to clear random backlogs; as utilisation approaches 100%, those recovery moments disappear and average waiting rises non-linearly.
question: Why can raising average utilisation from 90% to 95% more than double the expected wait in a simple one-server queue?
answer: The remaining spare-capacity margin is halved, from 10% to 5%. In the M/M/1 model, expected waiting in the queue is proportional to utilisation divided by that margin, so it rises from 9 to 19 average service times.
searchTerms: [waiting lines explained, capacity utilisation waiting time, why queues get long, spare capacity variability]
figure:
  type: comparison-bars
  data:
    style: proportional
    unit: average service times spent waiting
    items:
      - {label: 50% utilised, value: 1, display: "1"}
      - {label: 80% utilised, value: 4, display: "4"}
      - {label: 90% utilised, value: 9, display: "9"}
      - {label: 95% utilised, value: 19, display: "19"}
  afterParagraph: 3
  alt: In a simple random one-server queue, expected waiting rises from one average service time at 50 per cent utilisation to four at 80 per cent, nine at 90 per cent and nineteen at 95 per cent.
  caption: "In the M/M/1 model, halving the final spare-capacity margin from 10% to 5% raises expected waiting from 9 to 19 service times."
  description: Four proportional bars compare expected queueing delay in units of the average service time. The bars have lengths 1, 4, 9 and 19 for utilisation levels of 50, 80, 90 and 95 per cent. These values come from utilisation divided by one minus utilisation in the M/M/1 model; they are not universal forecasts for every real queue.
---
A supermarket checkout can be busy nine minutes out of ten and still look as if it has room to cope. Then three shoppers arrive together, one needs a price check, and the line persists long after the rush. The missing piece is not average speed. It is the system's ability to recover from variation.

Suppose work arrives randomly and one server handles it. When a burst creates a backlog, only moments in which service capacity exceeds new demand can shrink it. At 50% **utilisation**—the fraction of capacity used on average—there is abundant recovery time. At 90%, there is much less. At 100%, there is no average surplus at all.

That is why a queue can be stable only when average capacity is greater than average demand. Equality is not a comfortable balance for a variable system. A busy spell pushes work into the queue, but an equally busy average leaves no long-run spare capacity with which to bring it back down.

## A small model makes the bend visible

Consider a deliberately simple queue: one server, customers arriving independently at a constant average rate, and both inter-arrival and service times following exponential distributions. This is called an **M/M/1** queue. It assumes a steady state, first-come first-served service and no limit on how many customers will wait.

Let the server's average service time be one minute. Its average service rate is therefore one customer per minute. In this model, expected waiting time *before service*, measured in average service times, is:

**utilisation ÷ (1 − utilisation)**

At 50% utilisation, that is 0.5 ÷ 0.5 = 1 minute. At 90%, it is 0.9 ÷ 0.1 = 9 minutes. At 95%, it is 0.95 ÷ 0.05 = 19 minutes. Five extra percentage points of utilisation have not added five percentage points of delay; they have more than doubled the expected wait because the remaining recovery margin was halved.

The exact numbers belong to this model, not to every checkout, server or road. Real systems may have several servers, appointments, priorities, finite queues, changing demand or customers who leave. The durable insight is the shape: with unpredictable arrivals or service times, delay rises increasingly quickly as utilisation approaches the system's limit.

## Variation spends the buffer

Averages hide sequence. One customer every two minutes and two customers every four minutes have the same average arrival rate. With one-minute service, the first pattern can create no queue at all; the paired arrivals make one customer wait. More variable service times have the same kind of effect: an unusually long job allows arrivals to accumulate behind it.

Spare capacity is therefore not simply waste. It is a time buffer. Quiet intervals repay the backlog created by busy ones. Pooling several servers can also help because spare capacity at one server can absorb demand that would otherwise wait at another, although the benefit depends on how the queue is organised.

This does not mean every system should run half empty. Capacity has costs, and different systems tolerate delay differently. It means that “efficient” cannot be judged from utilisation alone. A nearly full system may look productive while transferring its missing buffer into somebody else's waiting time.
