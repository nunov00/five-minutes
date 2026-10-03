---
title: The Loop That Lets Machines Correct Themselves
description: Feedback control repeatedly measures a result and adjusts the system to keep it near a chosen target.
takeaway: Feedback makes a system resilient by using observed error to decide its next correction.
question: What makes a feedback-controlled system able to respond to a disturbance?
answer: It measures the current result, compares it with the target and uses the difference to choose a corrective action.
searchTerms:
  - feedback control
  - control loop
  - thermostat engineering
---
Set an oven to 180°C and its heater does not run at one fixed power forever. A sensor measures the temperature, a controller compares that measurement with the setting, and the heater changes in response.

That repeating process is a **feedback loop**. It has a target, a measurement and an action. The difference between the measured result and the target is the error. The controller uses that error to decide what to do next, then measures again.

## Why the loop matters

Without feedback, a machine must act on a prediction: apply this much heat for this long and hope the result is right. Open the oven door and the prediction fails. Feedback notices the temperature drop and adds heat, so the system can resist disturbances it was not asked to predict exactly.

Correction can also create trouble. If the response is too weak, the system approaches its target slowly. If it is too strong or arrives after a delay, it can overshoot, reverse and oscillate around the target. Control engineering is largely the art of getting a useful response without making the loop unstable.

Thermostats, cruise control and many biological processes share this pattern. Their parts differ, but the logic is the same: observe the result, compare it with the goal and let the mismatch shape the next action.

**Takeaway:** feedback replaces a one-off guess with repeated correction.
