---
title: How can predicting the next word produce a conversation?
description: A chatbot builds a reply piece by piece. The question, the reply so far and its training shape
  what can come next.
takeaway: A chat model generates each next text piece from the available context; assistant training and message
  roles turn that continuation process towards answering you.
question: The user asks “Make that simpler.” What in the model’s input tells it what “that” means and whose
  turn comes next?
answer: 'The earlier question and reply give “that” its subject: why ice floats. Role markers separate the
  messages and mark the start of a new assistant reply. Without the earlier exchange, the request still asks
  for a simpler answer, but no longer says what to simplify.'
searchTerms:
- how chatbots work
- next token prediction
- large language model conversation
- AI context
- instruction tuning
figures:
- id: lead
  role: lead
  figure:
    type: image
    src: /lesson-media/how-chatbots-build-an-answer-vlead1.webp
    width: 1536
    height: 1024
    afterParagraph: 1
    alt: Two conversation bubbles made of small tiles, with loose pieces joining the unfinished blue reply.
    caption: 'Conceptual artwork: a reply taking shape piece by piece, not a diagram of model internals.'
    description: A small ivory message sits behind a larger cobalt reply built from many small tiles. Three
      loose tiles approach the unfinished edge. The abstract ink marks are not words, and tile sizes do not
      represent real token lengths.
- id: context
  role: explanation
  figure:
    type: image
    src: /lesson-media/how-chatbots-build-an-answer-vcontext2.webp
    width: 960
    height: 454
    afterParagraph: 6
    alt: A role-labelled chat history ends with an assistant turn. As Ice becomes Ice takes, the longer text
      is used for the next prediction.
    caption: The next reply extends the same role-marked sequence. Each added piece joins the text used for
      the following prediction. Simplified labels and invented text, not exact token boundaries.[^2][^4]
    description: The user asks why ice floats, the assistant says ice is less dense, and the user asks to make
      that simpler. The final assistant marker opens a reply. Its start grows from Ice to Ice takes. The return
      arrow shows that the longer sequence is used for the next prediction.
---
Ask a chatbot to explain why ice floats. Then write, “Make that simpler.” It can often stay on the same subject without you naming ice again. How does a machine built to predict small pieces of text produce something that feels like a conversation?[^4]

The key is what it predicts *from*. A **language model** estimates which text piece could come next, given the text available to it. That piece is a **token**: sometimes a whole word, sometimes part of one, or punctuation. The available text is its **context**. “Next word” is convenient shorthand, but tokens are the actual pieces.[^1]

## More than the last few words

A model does not have to choose from the last word alone. In a Transformer, **attention** combines information from different positions in the text. In “Make that simpler”, information from the earlier words about ice can influence what follows, even though the new request does not mention ice.[^2]

Consider two invented requests: “Describe a river bank” and “Describe a savings bank.” Both replies could begin “The bank”. Yet “slopes towards the water” suits one, while “holds money for customers” suits the other. The identical reply start does not erase the question. These whole-word examples illustrate the relationship; they are not measured model outputs or probabilities.[^1][^2]

The model produces probabilities for possible next tokens, and the generation system selects one. The selected token joins the reply, becoming part of the context for the following prediction. Repeat that process and a sentence grows. Once the reply says “slopes”, “towards the water” becomes a natural continuation.[^1][^2]

## Why it answers instead of just continuing

Prediction alone does not specify whose turn comes next, or whether the text should be an answer, a poem or another question. A chat system formats the available messages into a sequence, with markers that distinguish the user from the assistant. In documented chat formats, an assistant-start marker tells the model which role to continue. On a later turn, earlier messages can be supplied again alongside the new question.[^4]

Training also shapes the continuation. In a 2022 research example, people first wrote desirable responses to prompts, and the researchers trained a model on those demonstrations. People then compared alternative responses. Those comparisons trained a separate model to predict preferences, which guided further training of the answering model. This encouraged more useful instruction-following. It is one established method, not a recipe followed identically by every chatbot.[^3]

That gives the opening exchange two ingredients. The available chat history connects “Make that simpler” to the earlier explanation. Training makes answering that request a useful kind of continuation. The model is not limited to repeating a fixed answer: the new request becomes part of what shapes the next reply.[^3][^4]

## Fluent is not the same as checked

None of this makes a polished sentence proof of a fact. The 2022 researchers still found invented facts and failures to follow instructions after their extra training. A plausible continuation and a verified answer are different achievements.[^3]

With no earlier messages supplied, “Make that simpler” has no ice explanation to refer to. One word can work like a pointer, but only when its target is in the context.[^4]
