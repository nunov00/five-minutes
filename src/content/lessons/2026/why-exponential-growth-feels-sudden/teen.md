---
title: Half the Doublings Do Not Give You Half the Result
description: Repeated doubling hides most of its growth near the end because every new increase starts from a larger number.
takeaway: Exponential growth feels surprising because equal steps in time create unequal jumps in amount.
question: After five of ten doublings, why are you nowhere near half the final amount?
answer: Each later doubling acts on a larger base, so the final few steps add far more than all the early steps.
searchTerms: [exponential growth explained, doubling numbers, compounding]
figure:
  type: comparison-bars
  alt: A quantity that doubles grows from 1 to 32 in five steps and to 1,024 in ten steps.
  caption: The last five doublings add far more than the first five.
  description: Begin at one. After five doublings the amount is 32, but after ten it is 1,024. Step five is only about three per cent of the final amount because each later jump starts from a bigger number.
  afterParagraph: 1
  data:
    unit: units after repeated doubling
    items:
      - label: Start
        value: 1
        display: "1"
      - label: Step 5
        value: 32
        display: "32"
      - label: Step 10
        value: 1024
        display: "1,024"
activity:
  prompt: "A quantity doubles each step and reaches its final amount after step 10. When was it half that amount?"
  options: ["After step 5", "After step 8", "After step 9"]
  answer: 2
  explanation: "It was half the final amount only one step earlier. The tenth doubling turns that half into the full amount, which is why so much exponential growth appears near the end."
---
Imagine a video has 1,000 views and its audience doubles every hour. Five hours later it has 32,000 views. That sounds large—until hour ten, when it passes one million. Half the hours produced only about three per cent of the final count.

Nothing suddenly went viral in hour six. The rule stayed the same; the base it acted on kept growing. Adding 1,000 views per hour would make a straight line. Doubling multiplies the whole current audience, so every jump contains all the earlier growth and then matches it.

This is why **doubling time** is more revealing than the latest increase. A steady doubling time creates larger and larger additions even though the clock never accelerates.

Real audiences, populations and technologies eventually run out of people, resources or room to expand. Exponential growth describes the stretch where proportional growth is a useful model, not a promise that doubling continues forever.
