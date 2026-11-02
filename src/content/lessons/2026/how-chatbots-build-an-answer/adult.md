---
title: How can predicting the next word produce a conversation?
description: A chatbot builds a reply piece by piece. The question, the reply so far and its training shape
  what can come next.
takeaway: A chat model generates each next text piece from the available context; assistant training and message
  roles turn that continuation process towards answering you.
question: Why can the same partial reply lead to different next words after two different questions?
answer: The model uses more than the last few words. The question and other available context affect its next-token
  probabilities, so the same partial reply can continue differently. The chosen continuation then becomes context
  for the following step.
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
    src: /lesson-media/how-chatbots-build-an-answer-vcontext1.webp
    width: 900
    height: 840
    afterParagraph: 4
    alt: The same reply start, The bank, continues towards a river description or a savings-bank description
      depending on the question.
    caption: The earlier question changes the useful continuation. Invented whole-word examples, not measured
      predictions or actual token boundaries.[^1][^2]
    description: With Describe a river bank, The bank can continue slopes towards the water. With Describe
      a savings bank, The bank can continue holds money for customers. These are illustrative continuations,
      not outputs or probabilities from a tested model. Real tokens may be smaller than words.
---
Ask a chatbot to explain why ice floats. Then write, “Make that simpler.” It can often stay on the same subject without you naming ice again. How does a machine built to predict small pieces of text produce something that feels like a conversation?[^4]

The key is what it predicts *from*. A **language model** estimates which text piece could come next, given the text available to it. That piece is a **token**: sometimes a whole word, sometimes part of one, or punctuation. The available text is its **context**. “Next word” is convenient shorthand, but tokens are the actual pieces.[^1]

## More than the last few words

A model does not have to choose from the last word alone. In a Transformer, a common language-model design, **attention** combines information from different positions in the context. The contribution of an earlier piece depends on the other pieces. This helps the prediction reflect a question asked several lines earlier, rather than only the unfinished sentence.[^2]

Consider two invented requests: “Describe a river bank” and “Describe a savings bank.” Both replies could begin “The bank”. Yet “slopes towards the water” suits one, while “holds money for customers” suits the other. The identical reply start does not erase the question. These whole-word examples illustrate the relationship; they are not measured model outputs or probabilities.[^1][^2]

The model produces probabilities for possible next tokens, and the generation system selects one. It need not always choose the most probable one. The selected token joins the reply, becoming part of the context for the following prediction. Repeat that process and a sentence grows. Crucially, each new piece changes what can sensibly follow: generating “river” makes a different continuation useful from generating “savings”.[^1][^2]

## Why it answers instead of just continuing

Prediction alone does not specify whose turn comes next, or whether the text should be an answer, a poem or another question. A chat system formats the available messages into a sequence, with markers that distinguish the user from the assistant. In documented chat formats, an assistant-start marker tells the model which role to continue. On a later turn, earlier messages can be supplied again alongside the new question.[^4]

Training also shapes the continuation. In a 2022 research example, people first wrote desirable responses to prompts, and the researchers trained a model on those demonstrations. People then compared alternative responses. Those comparisons trained a separate model to predict preferences, which guided further training of the answering model. This encouraged more useful instruction-following. It is one established method, not a recipe followed identically by every chatbot.[^3]

That gives the opening exchange two ingredients. The available chat history connects “Make that simpler” to the earlier explanation. Training makes answering that request a useful kind of continuation. The model is not limited to repeating a fixed answer: the new request becomes part of what shapes the next reply.[^3][^4]

## Fluent is not the same as checked

None of this makes a polished sentence proof of a fact. The 2022 researchers still found invented facts and failures to follow instructions after their extra training. A plausible continuation and a verified answer are different achievements. Search tools or other checking systems can add evidence, but generating text by itself is not that check.[^3]

With no earlier messages supplied, “Make that simpler” has no ice explanation to refer to. One word can work like a pointer, but only when its target is in the context.[^4]
