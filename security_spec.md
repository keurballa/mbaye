# Security Spec

## Data Invariants
1. A document must belong to the user who creates it.
2. The user can only access their own documents (enforced by `users/{userId}/...` path and `userId` check).

## The "Dirty Dozen" Payloads
1. Create with wrong `userId`.
2. Create without `fileKey`.
3. Update to change `userId`.
4. Update with extra ghost field `isAdmin: true`.
5. Update with wrong timestamp.
6. Create with document ID that is 1MB long.
7. Read another user's document.
8. Delete another user's document.
9. List another user's documents.
10. Update locked fields.
11. Update `systemName` to a number.
12. Create with huge string values.

## Summary
Only the owner can C/R/U/D documents in `users/{userId}/documents`.
