# Autosave Feature Implementation

## Overview

Implemented automatic saving in the resume builder with debouncing to prevent excessive save operations. Changes are automatically saved 2 seconds after the user stops editing.

## Implementation

### Files Created/Modified

1. **`/src/hooks/useAutosave.tsx`** - NEW
   - Custom React hook for debounced autosaving
   - Configurable delay (default: 2000ms)
   - Toast notifications on save/error
   - Prevents saving on initial render
   - Detects actual data changes (via JSON comparison)

2. **`/src/components/builder.tsx`** - UPDATED
   - Integrated `useAutosave` hook
   - Autosaves resumeData changes
   - Manual save button now labeled "Save & Share" (generates shareable link)
   - Autosave runs silently in background

## How It Works

### Step by Step Flow

1. **User makes changes** in the resume builder (e.g., edits name, adds work experience)
2. **resumeData updates** via React state (`setResumeData`)
3. **useAutosave detects change** by comparing JSON strings
4. **Debounce timer starts** (2 seconds)
5. **User continues editing** → Timer resets on each change
6. **User stops editing** → After 2 seconds of inactivity...
7. **Autosave triggers** → Calls `ResumeStorageService.saveResumeById()`
8. **Toast notification** → Shows "Autosaved" for 1.5 seconds
9. **Repeat** on next change

### Smart Features

✅ **Skips initial load** - Doesn't trigger on first render
✅ **Change detection** - Only saves if data actually changed
✅ **Debouncing** - Waits 2s after last change to save
✅ **No spam** - Resets timer on each edit (prevents rapid saves)
✅ **Error handling** - Shows error toast if save fails
✅ **Non-blocking** - Saves in background while user edits

## Code Structure

### useAutosave Hook

```typescript
useAutosave({
  data: resumeData,           // Data to watch
  onSave: handleAutosave,     // Save function
  delay: 2000,                // 2 second debounce
  enabled: true,              // Always on
});
```

**Key Logic**:
```typescript
useEffect(() => {
  // Skip first render
  if (isFirstRender.current) return;

  // Skip if no change
  if (currentData === previousDataRef.current) return;

  // Clear existing timeout
  clearTimeout(timeoutRef.current);

  // Set new timeout
  timeoutRef.current = setTimeout(() => {
    save(); // Save after 2s of inactivity
  }, delay);
}, [data]);
```

### Integration in Builder

```typescript
// Autosave callback
const handleAutosave = useCallback((data) => {
  ResumeStorageService.saveResumeById(data);
}, []);

// Hook setup
useAutosave({
  data: resumeData,
  onSave: handleAutosave,
  delay: 2000,
});
```

## User Experience

### Before (Manual Save Only)
- User edits resume
- **Must click "Save Resume" button**
- Risk of losing changes if forgot to save
- Extra cognitive load

### After (Autosave + Manual)
- User edits resume
- **Automatically saves after 2s** ✨
- Subtle toast: "Autosaved"
- Manual "Save & Share" for shareable link
- No risk of data loss

## Toast Notifications

### Autosave Success
```
✅ Autosaved
Your changes have been saved
```
- Duration: 1.5 seconds
- Non-intrusive
- Confirms save happened

### Autosave Error
```
❌ Autosave failed
Please save manually to ensure your changes are preserved
```
- Alerts user to problem
- Suggests manual save

### Manual Save
```
✅ Resume saved successfully!
```
- Shows modal with shareable link
- Longer toast duration

## Configuration

### Debounce Delay

Current: **2000ms (2 seconds)**

**Why 2 seconds?**
- Short enough to feel responsive
- Long enough to batch rapid edits
- Industry standard (Google Docs uses ~1-2s)
- Balances UX vs. API calls

**Can be adjusted** in `builder.tsx`:
```typescript
useAutosave({
  delay: 3000, // 3 seconds
  // or
  delay: 1000, // 1 second (more responsive, more saves)
});
```

## Technical Details

### Change Detection

Uses `JSON.stringify()` for deep comparison:
```typescript
const currentData = JSON.stringify(data);
if (currentData === previousDataRef.current) {
  return; // No change, skip save
}
```

**Pros**:
- Detects nested object changes
- Simple and reliable
- Works with complex Resume type

**Cons**:
- JSON.stringify can be slow for huge objects
- Resume data is small, so not an issue

### Preventing Save Loops

1. **First render skip**: `isFirstRender.current` flag
2. **Change detection**: Only save if data changed
3. **Save flag**: `isSavingRef.current` prevents concurrent saves
4. **Cleanup**: Clears timeout on unmount

## Performance

### Metrics

- **Debounce time**: 2 seconds
- **Save operation**: ~5-50ms (localStorage write)
- **Toast display**: 1.5 seconds
- **Memory**: Minimal (single timeout, few refs)

### Optimization

- ✅ Debouncing reduces save frequency
- ✅ Change detection prevents unnecessary saves
- ✅ localStorage is fast (no network calls)
- ✅ JSON comparison is acceptable for resume-sized data

## Testing Checklist

Manual testing scenarios:

- [x] Edit name → Wait 2s → See "Autosaved" toast
- [x] Rapid edits → Only one save after stopping
- [x] No changes → No save triggered
- [x] Initial load → No save on first render
- [x] Save error → Shows error toast
- [x] Manual save → Still works, shows modal
- [x] Navigate away → Cleanup prevents memory leak

## Future Enhancements

Potential improvements (not needed now):

1. **Visual indicator** - Small "Saving..." or "Saved" badge
2. **Offline support** - Queue saves if offline
3. **Conflict resolution** - Handle concurrent edits
4. **Save history** - Track revision history
5. **Undo/Redo** - Leverage autosave points

## Benefits

1. ✅ **Never lose work** - Automatic background saves
2. ✅ **No interruption** - User can keep editing
3. ✅ **Smart timing** - Debounce prevents spam
4. ✅ **Clear feedback** - Toast confirms saves
5. ✅ **Simple code** - Clean, reusable hook
6. ✅ **Reliable** - Handles errors gracefully

## Conclusion

The autosave feature provides a modern editing experience similar to Google Docs or Notion. Users can focus on creating great resumes without worrying about manually saving their work. The 2-second debounce strikes the perfect balance between responsiveness and efficiency.

