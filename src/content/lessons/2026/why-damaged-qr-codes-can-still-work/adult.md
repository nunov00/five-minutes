---
title: Why a Damaged QR Code Can Still Work
description: "Extra codewords let a scanner do more than notice damage: within limits, it can work out what changed and reconstruct the message."
takeaway: A QR code survives limited damage because mathematically related check codewords give its decoder enough constraints to reconstruct corrupted data.
question: Why can Reed–Solomon check codewords recover information rather than merely report that a QR code is damaged?
answer: The checks impose several known relationships across the stored codewords. Different errors break those relationships in different patterns, so within the code's limit the decoder can infer both where values changed and what their original values were.
searchTerms: [QR code error correction, damaged QR code, Reed-Solomon explained, QR code redundancy]
figure:
  type: concept-flow
  data:
    pattern: sequence
    nodes:
      - {label: Data becomes codewords, symbol: document}
      - {label: Check codewords are added, symbol: adjustment}
      - {label: Some symbols are damaged, symbol: object}
      - {label: Decoder rebuilds the data, symbol: output}
  afterParagraph: 2
  alt: Message data is encoded as codewords, related check codewords are added, damage changes some scanned symbols, and the decoder uses the surviving relationships to rebuild the data.
  caption: Error correction adds relationships the decoder can use later; it does not simply store a second copy of the message.
  description: First, message data is represented as codewords. Reed–Solomon coding calculates additional check codewords from that data. Dirt, a tear or a bad print may cause some scanned symbols to differ from what was encoded. If the number of errors is within the chosen correction capacity, the decoder uses the pattern of failed algebraic checks to infer the damaged codewords and recover the message.
---
A coffee stain covers part of a QR code, yet a phone still opens the link. The missing squares have not become readable. The code was designed so that the surviving information can sometimes determine what the damaged part must have contained.

The black and white modules are first interpreted as bits and grouped into eight-bit **codewords**. Some codewords carry the message and its formatting. Others are calculated from the message by a method called **Reed–Solomon error correction**. Those extra codewords are deliberate redundancy, but they are not a second complete copy.

## Several checks, not one checksum

A simple checksum might reveal that something changed without saying where. Reed–Solomon coding creates several algebraic relationships across a block of codewords. When a scanner reads a different value, each relationship fails in a particular way. Taken together, those discrepancies can contain enough information to locate changed codewords and calculate their original values.

Here is a toy illustration of the idea, not the arithmetic used by a QR decoder. Suppose three values are stored along with two checks: their sum, and a weighted sum in which the first value counts once, the second twice and the third three times. If one value changes, the ordinary sum reveals the size of the change. The weighted sum changes by one, two or three times that amount, revealing its position. Two independent relationships can therefore do more than one.

Actual Reed–Solomon codes perform a more powerful version of this reasoning with polynomials over a finite set of values. A valid block corresponds to a tightly constrained set of possible codewords. Damage moves the scanned block away from that set. Provided it has not moved too far, decoding finds the valid block consistent with the error pattern.

## Protection spends space

QR codes offer several error-correction levels. A higher level devotes more codewords to correction. For the same message, that can require a larger symbol; for a fixed symbol size, it leaves less room for message data. The design is buying resilience with capacity.

There is still a limit. A quoted correction level is not a promise that the same percentage of any visible patch may be removed. The grid must first be located and sampled, and damage affects codewords rather than neat areas of the image. Blur, poor contrast or destruction of important structural patterns can stop a scan before the correction mathematics gets a usable block.

So a phone is not guessing the covered link from context. It is solving a deliberately over-specified encoding problem: enough of the code survives to make the missing values the only answer that fits.
