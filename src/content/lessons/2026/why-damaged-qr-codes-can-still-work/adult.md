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

The black and white modules are first interpreted as bits and grouped into eight-bit **codewords**. Some codewords carry the message, including a short header describing how it is encoded. Others are calculated from the message by a method called **Reed–Solomon error correction**. Those extra codewords are deliberate redundancy, but they are not a second complete copy.

## Several checks, not one checksum

A simple checksum might reveal that something changed without saying where. Reed–Solomon coding creates several algebraic relationships across a block of codewords. When a scanner reads a different value, each relationship fails in a particular way. Taken together, those discrepancies can contain enough information to locate changed codewords and calculate their original values.

Here is a toy illustration of the idea, not the arithmetic used by a QR decoder. Suppose three values are stored along with two checks: their sum, and a weighted sum in which the first value counts once, the second twice and the third three times. If one value changes, the ordinary sum reveals the size of the change. The weighted sum changes by one, two or three times that amount, revealing its position.

Why are two checks useful here? One changed value introduces two unknowns: **where** the error is and **how much** the value changed. The two independent discrepancies supply information about both. More errors introduce more unknowns and demand more correction information. DENSO WAVE gives a simplified example in which correcting 50 codewords requires 100 Reed–Solomon codewords—twice the number to be corrected.

Actual Reed–Solomon codes perform a more powerful version of this reasoning with polynomials over a finite set of values. A valid block belongs to a tightly constrained set. Damage moves the scanned block away from that set. Within the code's correction bound, decoding identifies the nearest valid block: the one requiring the fewest codeword changes.

## Protection spends space

QR codes offer several error-correction levels. DENSO WAVE describes Level M as able to restore about 15% of total codewords and Level Q about 25%. The stronger level devotes more codewords to correction. For the same message, that can require a larger symbol; for a fixed symbol size, it leaves less room for message data. The design is buying resilience with capacity.

Those percentages are not a promise that the same fraction of any visible patch may be removed. They refer to total codewords, while a damaged patch can affect codewords unevenly. The grid must also be located and sampled before correction begins. Blur, poor contrast or destruction of important structural patterns can stop a scan before the mathematics gets a usable block.

So a phone is not guessing the covered link from context. It is solving a deliberately over-specified encoding problem: enough of the code survives to make the missing values the only answer that fits.
