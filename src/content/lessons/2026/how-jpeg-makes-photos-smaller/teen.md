---
title: What a JPEG Secretly Removes From Your Photo
description: JPEG keeps the patterns your eyes are likely to notice and stores less precision for detail that often matters less.
takeaway: A smaller JPEG is not a perfect copy; it is a reconstruction from selected and rounded image information.
question: Which step makes ordinary JPEG compression impossible to reverse perfectly?
answer: Quantization rounds pattern measurements, permanently discarding some of their original precision.
searchTerms: [jpeg explained, why photos lose quality, image compression]
---
A JPEG does not shrink a photo the way a suitcase squeezes clothes. It changes the description of the image and throws some precision away.

Photographs contain lots of repetition: nearby pixels often have similar colours and brightness. JPEG separates brightness from colour information, divides the picture into small blocks and describes each block using patterns—from broad smooth changes to fine detail.

Then comes **quantization**. The pattern values are rounded, often more strongly for detail that human vision is less likely to notice. Many tiny values become zero, which makes the remaining data easier to store compactly.

The decoder rebuilds an approximation. At gentle settings it may look almost identical. Push compression harder and block edges, blurry texture or ripples around sharp lines become visible. Save and recompress the file repeatedly, and new rounding can damage it further.

