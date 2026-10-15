---
title: The Random Ingredient Hidden Beside Your Password
description: A salt makes the same password leave a different stored result in every account.
takeaway: Salting forces an attacker to guess each stolen password hash separately instead of reusing the same shortcut everywhere.
question: If a salt is stored in the same database as the hash, what security job does it still perform?
answer: Its uniqueness changes the hash for each account, preventing identical passwords and precomputed guesses from producing one reusable stored result.
searchTerms:
  - what is a password salt
  - how websites store passwords
  - password hashes explained
activity:
  prompt: "Maya and Leo choose the same password, but the site gives each account a different random salt. What should their stored hashes look like?"
  options: ["Different, because the salts are different", "Identical, because the passwords match", "One hash will contain the readable password"]
  answer: 0
  explanation: "The hashing calculation uses both the password and the account's salt. Different salts therefore produce different stored hashes even when the passwords match."
---
Imagine thieves steal a website's login database. They find strange strings instead of readable passwords. Are the passwords safe?

Not automatically. A well-designed site stores a **hash**: the result of a one-way calculation. During login, it hashes your new input and checks whether the result matches. The site does not need to recover the original password.

An attacker can still make guesses. Try “football123”, hash it and compare the result. If the guess matches, the attacker has found the password without reversing anything.

## Why identical results are dangerous

If hashing used only the password, everyone who chose “football123” would have the same hash. One guess could expose many accounts. Attackers could also prepare enormous lists of common passwords and their hashes before stealing anything.

A **salt** ruins that shortcut. It is a random value unique to an account and included in the hashing calculation. The same password combined with two different salts produces two different hashes.

The salt can sit openly beside the hash. Secrecy is not its job; uniqueness is. After a breach, attackers must calculate guesses again for every account rather than testing one ready-made result across the whole list.

Salting does not rescue a weak password. Secure systems also choose password-hashing algorithms that deliberately make each guess expensive. Your password provides the secret; the salt stops shortcuts; the slow hash makes repeated guessing cost more.
