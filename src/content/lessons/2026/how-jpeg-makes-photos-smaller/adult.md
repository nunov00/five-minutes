---
title: How JPEG Throws Away Detail You Probably Will Not Notice
description: JPEG reduces photo size by representing image patterns efficiently and coarsening less visible detail.
takeaway: Lossy compression saves space by spending precision where it matters most and discarding information judged less noticeable.
question: Why can repeatedly saving a JPEG reduce its quality?
answer: Each lossy encoding can quantize the already altered image again, introducing additional irreversible approximation.
searchTerms: [how jpeg compression works, lossy compression, image quantization]
---
A camera records separate colour values for millions of pixels. Storing every value exactly is expensive, but neighbouring pixels in photographs are usually related. JPEG exploits that structure.

It converts colour information into components that separate brightness from colour differences, commonly storing colour detail less precisely. It then divides the image into small blocks and uses a discrete cosine transform to describe each block as a mixture of spatial-frequency patterns rather than individual pixels.

## The irreversible step

JPEG **quantization** rounds those pattern measurements. Fine variations can be rounded heavily or to zero, while visually important structure receives more precision. Long runs of simple values can then be encoded compactly.

Rounding is why standard JPEG is lossy: the decoder can construct a close image, not recover every original value. Strong compression may reveal block boundaries, ringing near sharp edges or smeared texture. Re-encoding can add further loss because another round of approximation is applied.

