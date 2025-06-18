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

2. Create the migration for the field in the migrations folder. Create a new folder in `./application/prisma/migrations` following the existing naming convention, and add a `migration.sql` file with the following content:

```sql
ALTER TABLE "Note"
ADD COLUMN "favorite" BOOLEAN NOT NULL DEFAULT FALSE;
```

3. Run migrations with `npx prisma migrate deploy`

### **2. Backend (API)**

1. Update the Note type/interface in `src/types.ts` to include `favorite: boolean`.
2. Update API endpoints:

   - `POST /api/notes`: Add the `favorite` field with default to false in the create DB operation.
   - `PUT /api/notes/:id`: Read the `favorite` param from request body allowing updating the favorite field. Pass the `favorite` value to the DB operation.
   - (Optional) Add a PATCH or dedicated endpoint: e.g., `PATCH /api/notes/:id/favorite` to toggle favorite status.
   - (Optional) When fetching notes, allow filtering by favorite using a query param (e.g., `?favorite=true`).

### **3. Frontend (App)**

1. Update the Note type/interface in `src/lib/api/notes.ts` to include `favorite: boolean`.
2. UI changes:

   - Add a “favorite” icon/button (e.g., a star or a heart) to each note in the list/grid view.
   - Visually indicate if a note is marked as favorite.
   - Allow users to click the icon/button to toggle favorite status.
   - Update the `handleUpdateNote` method to send the favorite field in the request with the api client or add another handler if you created a separate endpoint to handle favorite toggle.

3. API client changes:

   - If you plan to use the existing PATCH endpoint to update the favorite status, update the type `UpdateNoteData` to use the favorite field.
   - If you add a separate endpoint to manage the favorite state, you can add a method to toggle favorite status (e.g., `toggleFavorite(noteId, isFavorite)`).

4. State management:

   - Update the local state after toggling favorite, so the UI updates immediately

5. (Optional) Filtering:

   - Add a filter or tab to show only favorite notes.

### **4. Testing**

1. Add/Update tests for:

   - Creating a note with/without favorite.
   - Updating/toggling favorite status.
   - Filtering notes by favorite.
   - Run the tests to verify them using these commands: `npm run test` for the client app and `npm run test:server` for API tests. Alternatively, you can run `npm run test:all` that run both suites of tests.
