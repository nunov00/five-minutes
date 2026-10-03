---
title: How a Thermostat Knows What to Do Next
description: A feedback loop keeps checking the result and correcting the system instead of trusting one perfect prediction.
takeaway: Feedback works because each new action is based on the error the system can currently observe.
question: Why does a thermostat need to keep measuring the room after the heating starts?
answer: The temperature changes with weather, open doors and other disturbances, so each measurement tells the controller whether to heat more, stop or correct again.
searchTerms:
  - feedback loop explained
  - how thermostats work
  - control systems
---
Suppose a heater tried to warm a room by running for exactly twenty minutes. That might work once. On a colder day, or with a window open, the room would end up at a different temperature.

A thermostat uses a better method. You give it a target temperature. A sensor checks the room, and the controller compares the measurement with the target. If the room is too cold, it calls for heat. Then it checks again.

This repeating pattern is a **feedback loop**. The gap between the target and the measured result is called the error. New actions depend on that error, so the system can respond when something unexpected changes.

More correction is not always better. A slow system may take too long to reach its target, but an aggressive one can overshoot. Add a delay, and it may keep swinging above and below the target because every correction arrives late.

The same basic loop appears in cruise control and many robots: measure, compare, act, repeat.

