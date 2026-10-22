---
title: How Adding Sound Can Make Things Quieter
description: Noise-cancelling headphones listen to nearby noise and play a carefully timed opposite sound, making the pressure changes at your ear smaller.
takeaway: Active noise cancellation works by measuring unwanted sound and adding an opposite pressure pattern near your ear; steady low sounds are easier because the system has more time to predict and align each cycle.
question: Why can noise-cancelling headphones reduce a steady engine hum better than a nearby conversation?
answer: A hum repeats and often has low frequencies with longer cycles, so the headphones can predict and time an opposite pattern more accurately. Speech changes quickly and contains higher frequencies, where the same delay creates a larger timing error.
searchTerms: [how noise cancelling works, anti-noise, destructive interference, headphones engine hum]
activity:
  prompt: Which sound should active noise cancellation usually reduce most easily?
  options: ["A steady low engine hum", "A nearby person changing words quickly", "One sudden hand clap"]
  answer: 0
  explanation: A steady low hum repeats and has relatively long wave cycles. That gives the controller time to estimate the next pressure change and align anti-noise with it. Speech and a clap change more suddenly and contain more high-frequency detail.
figure:
  type: concept-flow
  data:
    pattern: sequence
    nodes:
      - {label: Microphone hears the noise, symbol: sensor}
      - {label: Chip makes opposite sound, symbol: adjustment}
      - {label: Speaker plays anti-noise, symbol: source}
      - {label: Ear receives a smaller wave, symbol: output}
  afterParagraph: 3
  alt: A microphone hears outside noise, a chip works out an opposite sound, the headphone speaker plays it, and the two sounds combine into a smaller pressure wave at the ear.
  caption: The added sound must reach the ear at the right time to reduce the unwanted sound.
  description: The headphone microphone turns incoming sound into a signal. A chip calculates anti-noise with pressure changes opposite to the expected noise. A small speaker plays that pattern inside the ear cup. Where a noise peak meets an anti-noise trough, their sum is smaller, so less of the original pressure change reaches the ear.
---
You switch on noise cancellation during a flight, and the steady engine rumble fades. The engines are still making noise. The ear cups help block some sound, but the electronics do something stranger: they play more sound.

Sound is a pattern of air pressure rising and falling. When two sounds reach the same place, their pressure changes add. Two rises make a larger rise. But a rise from one wave and an equal fall from another can make a much smaller change.

Noise-cancelling headphones use this rule. A microphone listens to the noise. A chip calculates **anti-noise**, a sound pattern meant to be opposite when it reaches your ear. A speaker inside the headphones plays that pattern. The process is called **active noise cancellation**.

## Opposite at the right moment

Imagine a regular wave with peaks and troughs. To reduce it, an anti-noise trough must meet each noise peak, and an anti-noise peak must meet each noise trough. This is called **destructive interference**. The sounds have not disappeared before they meet; their combined pressure change is simply smaller at your ear.

Timing matters. The outside noise takes time to travel from the microphone to your ear. The headphones need to measure it, calculate a response and move the speaker before it arrives. Some systems also listen inside the ear cup for sound that remains and adjust the next response.

The cancellation is designed for the small space near your ear. It does not erase the engine sound from the cabin. Change the headphone fit or move the listening point, and the sound paths change too. That is one reason the result is reduction, not perfect silence.

## Long, steady waves give more warning

A steady engine hum repeats. Once the controller has measured several cycles, the next one is less surprising. Low-frequency sounds also have longer cycles, so a tiny delay is only a small part of one cycle.

Speech and claps are harder. They change quickly and include high frequencies with short cycles. During one small processing delay, a high-frequency wave may already move far around its cycle. The anti-noise can then arrive too late to be properly opposite.

The ear pads still matter because they physically reduce sound entering the cup, especially at frequencies that active control handles poorly. Good noise-cancelling headphones therefore combine two methods: a barrier that blocks some sound and a fast control system that adds a carefully timed sound to reduce what remains.
