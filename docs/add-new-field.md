# Adding a new field to notes

Now that you deployed or run locally the app, you may want to make some changes to play with it. Here is a list of steps that you can use as a guideline to add the possibility to mark a note as a favorite.

### **1. Prisma schema**

1. Add a `favorite` field to the `Note` model (default: `false`)

   ```
   model Note {
     id        String   @id @default(uuid())
     userId    String
     title     String
     content   String
     createdAt DateTime @default(now())
     // Add this line:
     favorite  Boolean  @default(false)
     // ...other fields...
   }
   ```

2. Run migrations with `npx prisma migrate deploy`

### **2. Backend (API)**

1. Update the Note type/interface in your backend TypeScript code to include `favorite: boolean`.
2. Update API endpoints:

   - `GET /api/notes`: Include the favorite field in responses.
   - `POST /api/notes`: Allow setting favorite (optional, default to false).
   - `PUT /api/notes/:id`: Allow updating the favorite field.
   - (Optional) Add a PATCH or dedicated endpoint: e.g., `PATCH /api/notes/:id/favorite` to toggle favorite status.

3. Update database queries:

   - When creating or updating a note, handle the `favorite` field.
   - When fetching notes, allow filtering by favorite (e.g., `?favorite=true`).

### **3. Frontend (App)**

1. Update the Note type/interface in your frontend code to include `favorite: boolean`.
2. UI changes:

   - Add a “favorite” icon/button (e.g., a star) to each note in the list/grid view.
   - Visually indicate if a note is marked as favorite.
   - Allow users to click the icon/button to toggle favorite status.

3. API client changes:

   - Update the API client to send/receive the `favorite` field.
   - Add a method to toggle favorite status (e.g., `toggleFavorite(noteId, isFavorite)`).

4. State management:

   - Update the local state after toggling favorite, so the UI updates immediately

5. (Optional) Filtering:

   - Add a filter or tab to show only favorite notes.

### **4. Testing**

1. Add/Update tests for:

   - Creating a note with/without favorite.
   - Updating/toggling favorite status.
   - Filtering notes by favorite.
