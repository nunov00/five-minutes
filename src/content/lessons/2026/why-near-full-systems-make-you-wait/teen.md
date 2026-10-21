---
title: Why an Almost-Full Queue Gets Slow So Fast
description: A checkout or computer system needs quiet moments to catch up after random bursts. Near full capacity, those recovery moments almost disappear.
takeaway: Spare capacity lets a system clear the small backlogs caused by uneven arrivals and service times; when almost all capacity is already used, each new burst takes much longer to absorb.
question: Why is some spare capacity useful even when the average service rate already exceeds the average arrival rate?
answer: Arrivals and service times are uneven. A short burst can create a backlog, and the system needs later moments when it can finish work faster than new work arrives to clear that backlog.
searchTerms: [why queues get long, waiting lines explained, spare capacity, busy checkout waiting]
activity:
  prompt: A one-minute server gets six customers per 12 minutes. A gets one every two minutes; B gets pairs every four. Which causes more waiting?
  options: ["B, because each pair briefly creates a queue", "A, because its server is interrupted more often", "Neither, because the average arrival rate is the same"]
  answer: 0
  explanation: Both patterns average one customer every two minutes, but B's paired arrivals put two customers in front of a server that can handle only one at a time. One waits. Averages do not show whether work arrives smoothly or in bursts.
figure:
  type: concept-flow
  data:
    pattern: sequence
    nodes:
      - {label: Several jobs arrive together, symbol: source}
      - {label: One server handles a job, symbol: filter}
      - {label: New work joins the backlog, symbol: container}
      - {label: Spare time clears the queue, symbol: output}
  afterParagraph: 2
  alt: Several jobs arrive together, one server handles them one at a time, new work can join the backlog, and later spare time is needed to clear the queue.
  caption: A burst creates the queue; only later spare capacity can remove it.
  description: Several jobs reach one server at almost the same time. The server completes one while the others wait. If more work arrives before the waiting jobs are finished, the backlog remains. A quieter interval lets the server work faster than new jobs arrive and reduce the queue.
---
Imagine one supermarket checkout can serve about ten shoppers in ten minutes. If nine shoppers arrive, it sounds as if the checkout has room to spare. But they do not arrive neatly, one per minute. Three may appear together, and one large trolley may take longer than usual.

That unevenness creates a queue. Once people are waiting, the checkout catches up only during a quieter spell—when it serves shoppers faster than new ones join. The unused part of its capacity is what makes catching up possible.

## The last empty space matters most

**Utilisation** means the share of a system's capacity being used on average. At 50% utilisation, roughly half the capacity is available to absorb a burst. At 90%, only about a tenth remains. Move from 90% to 95%, and the average spare share is cut in half, even though the utilisation number rose by only five percentage points.

That does not mean every 95%-busy checkout has the same wait. Real queues differ. Some have several servers, appointments or customers who leave. The point is that when arrivals and service times vary, waiting does not usually grow in a straight line. Near the limit, a small increase in demand can remove a large part of the remaining recovery room.

At exactly 100% average utilisation, a variable queue has a deeper problem. A busy spell can add several jobs, while the average workload leaves no spare capacity to remove them later. The line can keep carrying old delays forward. If average demand is greater than capacity, the backlog tends to grow rather than settle.

## Same average, different wait

Suppose a one-minute server receives one job every two minutes. If that timing is perfectly regular, each job can finish before the next arrives. Now send two jobs together every four minutes. The average is still one job every two minutes, but one of each pair must wait.

This is why averages are necessary but not enough. A checkout, call centre or computer can look comfortably fast on an average-rate chart and still produce long waits when work comes in bursts. Spare capacity is the breathing room that turns a rush into a temporary queue instead of a permanent one.
