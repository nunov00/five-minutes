---
title: How a QR Code Can Survive a Scratch
description: A QR code stores extra mathematical clues, so losing a few parts does not always lose the message.
takeaway: A QR code can recover from limited damage because it stores extra check codewords that constrain what the missing or changed data could have been.
question: Why is the extra information in a QR code more useful than simply noticing that something went wrong?
answer: Several check codewords connect different parts of the data. The way those checks disagree can reveal which values changed and what values would make all the relationships work again.
searchTerms: [how QR codes work, scratched QR code, QR error correction, why damaged QR scans]
activity:
  prompt: The message stays the same, but a QR maker chooses stronger error correction. What trade-off should you expect?
  options: [More space is used for checks, The phone can ignore the square pattern, The message is stored as an identical second copy]
  answer: 0
  explanation: Stronger correction uses more check codewords. That improves the amount of damage the code may survive, but it reduces message capacity or requires a larger QR symbol.
figure:
  type: concept-flow
  data:
    pattern: sequence
    nodes:
      - {label: Message becomes codewords, symbol: document}
      - {label: Extra clues are added, symbol: adjustment}
      - {label: A few parts are damaged, symbol: object}
      - {label: Decoder restores the message, symbol: output}
  afterParagraph: 2
  alt: A message becomes groups called codewords, extra mathematical clues are added, damage changes a few scanned parts, and the decoder uses the clues to restore the message.
  caption: The extra clues connect many parts of the data, helping a decoder repair a limited number of errors.
  description: The message is first turned into groups of bits called codewords. Reed–Solomon error correction calculates extra check codewords from them. If a scratch or stain changes a limited number of scanned values, the checks no longer agree. Their pattern of disagreement can tell the decoder which values need changing so the original message can be recovered.
---
You point a phone at a scratched QR code. A corner is scuffed and several little squares are unreadable—yet the link opens. The phone cannot see through the scratch. So where did the missing information come from?

It was built into the code from the start. A QR code turns its message into groups of bits called **codewords**. It then calculates extra check codewords from those groups. The method is called **Reed–Solomon error correction**.

## Clues that work together

Imagine storing four mystery numbers along with several clues: perhaps their total, then other totals that give the numbers different weights. Change one mystery number and all the clues stop matching—but not in the same way. The pattern of mismatches can point to both the changed position and the amount it changed.

QR correction uses more advanced mathematics, but the useful idea is the same. Each check connects to multiple pieces of data. If a scratch changes a limited number of scanned codewords, the decoder looks for the original values that make all those relationships agree again.

That is more powerful than saving one total, which might only announce “something is wrong”. It is also different from storing the whole message twice. The extra codewords are compact clues calculated from the message.

## Damage has a budget

More check codewords can protect against more errors, but they need space. QR codes therefore offer different correction levels. Stronger protection means less room for the message in the same-sized code, or a larger grid for the same message.

Correction is not magic. If too many codewords are damaged, the checks no longer determine a reliable correction and decoding fails. A phone also has to find and read the grid well enough to produce codewords in the first place, so blur and poor contrast can defeat a code that has only a small scratch.

The scan succeeds not because the phone invents what is hidden, but because the visible parts still leave a mathematical trail back to the original message.
