# Security Specification - Velocity Cafe

## Data Invariants
1. A review must belong to a valid authenticated user.
2. A photo must belong to a valid authenticated user.
3. Users can only update their own profile fields (displayName, photoURL).
4. `role` is immutable for regular users after creation (handled by check for `affectedKeys().hasOnly(['displayName', 'photoURL', 'updatedAt'])`).
5. `createdAt` must be `request.time`.

## The Dirty Dozen Payloads (Rejection Tests)

1. **Identity Spoofing (Review)**: Authenticated User A tries to post a review as User B.
   - Payload: `{ "userId": "userB", "userName": "User B", "userAvatar": "...", "text": "Hacked", "rating": 5, "createdAt": request.time }`
   - Expected: `PERMISSION_DENIED` (Rule `isValidReview` checks `data.userId == request.auth.uid`).

2. **Shadow Field Injection**: Try to add `isAdmin: true` to a review.
   - Payload: `{ ..., "isAdmin": true }`
   - Expected: `PERMISSION_DENIED` (Rule `isValidReview` checks `data.keys().size() == 6`).

3. **Email Spoofing (Profile)**: User tries to change their own role to 'admin'.
   - Payload: `{ "displayName": "Me", "photoURL": "...", "role": "admin", "updatedAt": request.time }`
   - Expected: `PERMISSION_DENIED` (Update rule uses `hasOnly(['displayName', 'photoURL', 'updatedAt'])`).

4. **Resource Poisoning (ID)**: Submitting a review with a 2MB string as ID.
   - Expected: `PERMISSION_DENIED` (Handled by implicit Firestore constraints and `isValidId` if applied).

5. **PII Leakage**: Trying to read another user's profile while not logged in.
   - Expected: `PERMISSION_DENIED` (Rule `users` requires `isSignedIn()`).

6. **State Shortcutting**: Updating a review's `userId` after creation.
   - Expected: `PERMISSION_DENIED` (Only `create` and `delete` allowed for reviews).

7. **Invalid Rating**: Submitting `rating: 10`.
   - Expected: `PERMISSION_DENIED` (`isValidReview` checks `data.rating <= 5`).

8. **Future Timestamp**: Submitting `createdAt: "2099-01-01"`.
   - Expected: `PERMISSION_DENIED` (`isValidReview` checks `data.createdAt == request.time`).

9. **Ghost User**: Creating a user profile for a different UID.
   - Expected: `PERMISSION_DENIED` (`match /users/{userId}` check `isOwner(userId)`).

10. **Malicious Content**: Submitting a 500k char review text.
    - Expected: `PERMISSION_DENIED` (`isValidReview` checks `data.text.size() <= 1000`).

11. **Orphaned Photo**: Submitting a photo without a `userId`.
    - Expected: `PERMISSION_DENIED` (`isValidPhoto` checks `hasAll(['userId', ...])`).

12. **Anonymous Read**: Trying to list users while logged out.
    - Expected: `PERMISSION_DENIED` (Rule `users` requires `isSignedIn()`).
