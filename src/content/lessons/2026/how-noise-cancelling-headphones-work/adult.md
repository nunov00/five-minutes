---
title: How Headphones Cancel Sound with Sound
description: "Active noise control does not block a sound at its source. It estimates the pressure changes that will reach your ear, then adds a second sound designed to reduce their sum."
takeaway: Noise-cancelling headphones measure outside sound and produce a carefully timed anti-noise signal; the two pressure patterns add at the ear, so opposite changes partly cancel, but delay and position prevent perfect cancellation.
question: Why does a small timing error usually hurt the cancellation of a high-frequency sound more than that of a low-frequency hum?
answer: A high-frequency wave completes each cycle in less time. The same processing delay therefore represents a larger fraction of its cycle, so the anti-noise peak is more likely to miss the noise trough and leave a larger residual sound.
searchTerms: [how noise cancelling headphones work, active noise cancellation, destructive interference, anti-noise explained]
figure:
  type: concept-flow
  data:
    pattern: sequence
    nodes:
      - {label: Microphone measures noise, symbol: sensor}
      - {label: Processor predicts arrival, symbol: clock}
      - {label: Speaker adds anti-noise, symbol: source}
      - {label: Smaller wave reaches ear, symbol: output}
  afterParagraph: 3
  alt: A microphone measures incoming noise, a processor predicts the sound at the ear, a speaker adds an opposite pressure pattern, and the combined pressure change at the ear is smaller.
  caption: The controller must shape and time anti-noise for the point near the listener's ear.
  description: An outside microphone converts incoming sound into an electrical signal. A processor estimates how that sound will change on its path through the ear cup and creates an anti-noise signal. The headphone speaker plays the anti-noise so its pressure peaks meet the incoming sound's pressure troughs near the ear. Their sum has a smaller amplitude, although errors leave some residual sound.
---
Put on active noise-cancelling headphones beside a steady ventilation fan. The fan seems quieter even before music starts. The headphones have not removed the fan's vibration or stopped its sound crossing the room. They have added another sound close to your ear.

Sound in air is a travelling pattern of pressure rising and falling. When two sound waves meet, the air does not choose one of them: their pressure changes add. Two positive changes reinforce each other. A positive change and an equal negative change sum to zero at that instant. This addition of waves is called **superposition**; reduction caused by opposite changes is **destructive interference**.

Active noise control uses that addition deliberately. A microphone measures the incoming noise. A processor estimates what that sound will be like when it reaches the ear, including changes caused by the ear cup, speaker and small enclosed space. The speaker then produces **anti-noise**: a pressure pattern intended to be equal in size and opposite in direction at the ear.

## Cancellation is local, not deletion

The neat drawing of two opposite waves suggests silence everywhere, but real headphones control a small acoustic region. Noise reaches the outside microphone, speaker and ear by different paths. Moving the headphones changes those paths. A wave that opposes the noise at the ear may not oppose it at another point.

The processor must also act before its estimate becomes stale. If it waits until a pressure peak reaches the ear and only then makes an opposite peak, the correction is late. Feedforward systems use an outer microphone to gain advance information. Feedback systems use a microphone nearer the ear to measure the residual—the sound left after cancellation—and adjust the output. Many designs combine both ideas.

This is a control problem rather than a one-time recording. The electronics continually update the anti-noise because the unwanted sound, fit and acoustic path can change. The aim is not to make a mathematically inverted copy at the outer microphone. It is to minimise the remaining pressure variation at the listening point.

## Why a hum is the easier target

A steady engine or fan produces a pattern that changes slowly and repeats. That gives a controller useful evidence about what is about to arrive. Low-frequency waves also have longer cycles. A fixed delay or position error occupies a smaller fraction of a long cycle, so the anti-noise can still arrive fairly close to the required opposite phase.

A consonant, clap or clattering dish changes abruptly and contains substantial high-frequency energy. At high frequency, each cycle is short. The same delay becomes a larger phase error: a supposed trough may arrive partway towards a peak and cancel less, or even add to the sound. Passive parts of the headphone—the ear-pad seal and solid cup—therefore remain important, especially for higher frequencies.

Noise cancellation is consequently neither a force field nor perfect silence. It is rapid, repeated estimation followed by a physical addition: measure a disturbance, predict its arrival, and add a pressure pattern that makes the local sum smaller.
