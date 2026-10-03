---
title: Why GPS Needs Two Kinds of Relativity
description: Speed and gravity pull satellite clocks in opposite directions, and navigation works only after accounting for both effects.
takeaway: GPS turns Einstein's predictions about time into an everyday engineering correction.
question: Why do GPS engineers need both special and general relativity?
answer: A satellite's motion slows its clock relative to Earth, while weaker gravity speeds it up; GPS must account for the combined difference to measure signal travel times accurately.
searchTerms:
  - satellite clocks
  - gps relativity
  - time dilation
---
A map pin on your phone depends on clocks that do not agree with clocks on Earth.

Each GPS satellite broadcasts its position and the time its signal was sent. A receiver compares signals from several satellites. From their travel times—and therefore their distances—it calculates where those distances meet. Because radio signals travel at the speed of light, an error of a few billionths of a second already means an error of metres.

## Two effects, opposite directions

Special relativity says that motion makes the orbiting satellite clock run slower relative to a clock on Earth, by about 7 microseconds per day. General relativity says that the satellite's weaker gravity makes its clock run faster, by about 45 microseconds per day.

The effects do not cancel. Together, the satellite clock gains about 38 microseconds per day relative to ground clocks. GPS is designed to account for that difference. Without the correction, timing errors would become positioning errors so quickly that the system would soon be useless for navigation.

