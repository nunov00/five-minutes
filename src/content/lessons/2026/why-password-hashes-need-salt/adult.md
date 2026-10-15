---
title: Why Password Hashes Need Salt
description: A unique random input prevents identical passwords from leaving identical fingerprints in a stolen database.
takeaway: A unique salt makes password attacks less reusable by forcing stolen hashes to be guessed account by account.
question: Why can a salt be stored beside the password hash without defeating its purpose?
answer: A salt does not need to be secret; its job is to make each account's hash different so attackers cannot reuse one precomputed result across many accounts.
searchTerms:
  - password salt explained
  - password hashing
  - stolen password database
---
A responsible service does not need to remember your password. It needs a reliable way to recognise it the next time you sign in.

Instead of storing the password itself, the service feeds it into a password-hashing algorithm and stores the result. When you log in, it processes the password you submit in the same way. A matching result means the input was the same.

## One-way does not mean unguessable

A hash is not encrypted text waiting for a decryption key. The calculation is designed to go forwards, not backwards. But an attacker who steals a hash can still try likely passwords, hash each guess and look for a match.

Without another ingredient, identical passwords produce identical stored results. An attacker can spot reused passwords, calculate common guesses in advance or test one guess against many accounts at once.

## Salt breaks the shortcut

A **salt** is a unique random value added to each password before hashing. Two people may choose the same password, but their different salts produce different hashes.

The service stores the salt beside the hash because the salt is not meant to be secret. Its value comes from being unique. An attacker can still test guesses, but must repeat the work separately for each salt instead of reusing one calculation across the database.

Salt is not enough by itself. It does not strengthen a weak password or stop guessing. Modern password-hashing schemes also use a cost factor so every guess consumes deliberate time, memory or both. The defence is layered: a strong password reduces plausible guesses, salt removes shared shortcuts, and a costly hash slows each attempt.
