# User Flow Simplification Plan

## Problem Statement

Current system has redundant state management:
- `currentResume` is optional in `ResumeGenerationInput`
- System conditionally extracts data from `Person.raw_content` OR uses existing resume
- Multiple code paths for same outcome
- Unnecessary complexity in resume generation pipeline

## Solution Overview

**Two-Phase Approach:**
1. **Profile Creation → Base Resume** (one-time conversion)
2. **Base Resume + Job → Optimized Resume** (repeatable optimization)

---

## Current Flow (Redundant)

```
1. User creates Profile (Person with raw_content)
   └─> Saved to ProfileStorage

2. User generates resume for job:
   ├─> Input: { person, currentResume?: Resume, targetJob }
   ├─> Check: Does currentResume exist?
   │   ├─> NO: Extract workExperience + skills from person.raw_content
   │   └─> YES: Use currentResume.workExperience + skills
   ├─> Analyze job requirements
   ├─> Extract keywords
   ├─> Optimize summary (uses currentResume?.summary || '')
   ├─> Enhance work experience
   ├─> Optimize skills
   └─> Generate final resume
```

**Problems:**
- Conditional logic everywhere (`currentResume?.workExperience || []`)
- `extractPersonData()` sometimes called, sometimes not
- Duplicate data extraction paths
- Optional `currentResume` creates complexity

---

## New Flow (Simplified)

```
1. User creates Profile (Person with raw_content)
   ├─> Saved to ProfileStorage
   └─> IMMEDIATELY: Generate Base Resume from profile
       ├─> Call: profileToBaseResume(person)
       ├─> Cache: base-resume-{profileId}
       └─> Returns: Complete Resume object

2. User generates job-specific resume:
   ├─> Input: { baseResume: Resume, targetJob: TargetJobJson }
   ├─> Analyze job requirements
   ├─> Extract keywords
   ├─> Optimize summary (from baseResume.summary)
   ├─> Enhance work experience (from baseResume.workExperience)
   ├─> Optimize skills (from baseResume.skills)
   └─> Generate final resume
```

**Benefits:**
- No conditional logic
- Single data flow path
- `Resume` is always required (not optional)
- Base resume cached per profile
- Cleaner code, easier to maintain

---

## Implementation Steps

### Phase 1: Create Profile → Base Resume Pipeline

#### 1.1 Create Base Resume Schema & Prompt
**File:** `/src/services/langchain/schemas.ts`
- [x] Review existing `personDataExtractionSchema`
- [ ] Create `profileToBaseResumeSchema` (full Resume structure)

**File:** `/src/services/langchain/prompts.ts`
- [ ] Create `profileToBaseResumePrompt`
  - Input: Person (name, raw_content)
  - Output: Complete Resume (all fields populated from raw_content)
  - Extract: personal info, work experience, education, skills, projects, etc.

#### 1.2 Create Base Resume Chain
**File:** `/src/services/langchain/chains.ts`
- [ ] Create `createProfileToBaseResumeChain()`
- [ ] Export `profileToBaseResumeChain` and `profileToBaseResumeParser`

#### 1.3 Add Base Resume Generation Method
**File:** `/src/services/langchainResumeGenerator.ts`
- [ ] Add method: `async generateBaseResume(person: Person): Promise<Resume>`
  - Calls the profileToBaseResume chain
  - Returns complete Resume object

**File:** `/src/services/langchain/cache.ts`
- [ ] Add cached version: `async generateBaseResume(person: Person): Promise<Resume>`
  - Cache key: `base-resume-{hash(person.name + person.raw_content)}`
  - Wraps `super.generateBaseResume(person)`

#### 1.4 Create Base Resume Server Action
**File:** `/src/app/actions/resumeGeneration.ts`
- [ ] Add: `async generateBaseResumeAction(person: Person): Promise<Resume>`
  - Calls `CachedLangChainResumeGenerator.generateBaseResume(person)`
  - Returns Resume

---

### Phase 2: Update Profile Creation Flow

#### 2.1 Update Profile Storage
**File:** `/src/services/profileStorage.ts`
- [ ] Add `baseResumeId?: string` to `SavedProfile` interface
- [ ] Update `saveProfile()` to optionally store base resume reference

#### 2.2 Update Profile Page UI
**File:** `/src/app/dashboard/profile/page.tsx`
- [ ] When creating profile:
  1. Save person to ProfileStorage
  2. Call `generateBaseResumeAction(person)`
  3. Save returned Resume to ResumeStorage
  4. Update profile with `baseResumeId`
- [ ] Show loading state during base resume generation
- [ ] Display success message: "Profile and base resume created"

#### 2.3 Update Profile Form Component
**File:** `/src/components/resumeGenerator/forms/PersonForm.tsx`
- [ ] Add optional `onGenerateBaseResume` callback
- [ ] Show progress indicator when generating base resume

---

### Phase 3: Simplify Resume Generation Pipeline

#### 3.1 Update Types
**File:** `/src/types/index.ts`
- [ ] Change `ResumeGenerationInput`:
  ```typescript
  // OLD:
  export interface ResumeGenerationInput {
    person: Person;
    currentResume?: Resume; // Optional
    targetJob: TargetJobJson;
  }

  // NEW:
  export interface ResumeGenerationInput {
    baseResume: Resume;      // Required!
    targetJob: TargetJobJson;
  }
  ```

#### 3.2 Remove extractPersonData Chain
**File:** `/src/services/langchain/chains.ts`
- [ ] Remove `personDataExtractionChain` (replaced by profileToBaseResumeChain)
- [ ] Remove `personDataExtractionParser`

**File:** `/src/services/langchain/prompts.ts`
- [ ] Remove `personDataExtractionPrompt`

**File:** `/src/services/langchain/schemas.ts`
- [ ] Remove `personDataExtractionSchema`
- [ ] Remove `PersonDataExtraction` type

#### 3.3 Simplify Resume Generator
**File:** `/src/services/langchainResumeGenerator.ts`

- [ ] **Remove** `extractPersonData()` method
- [ ] **Update** `optimizeSummary()`:
  ```typescript
  // OLD:
  async optimizeSummary(personData: Person, targetJob: TargetJobJson, jobAnalysis: JobAnalysis, keywords: string[], currentResume?: Resume): Promise<string>

  // NEW:
  async optimizeSummary(baseResume: Resume, targetJob: TargetJobJson, jobAnalysis: JobAnalysis, keywords: string[]): Promise<string>
  ```

- [ ] **Update** `generateResume()`:
  ```typescript
  // OLD:
  async generateResume(
    personData: Person,
    currentResume: Resume | undefined,
    targetJob: TargetJobJson,
    jobAnalysis: JobAnalysis,
    optimizedSummary: string,
    enhancedWorkExperience: WorkExperience[],
    optimizedSkills: SkillCategory[],
    keywords: string[]
  ): Promise<Resume>

  // NEW:
  async generateResume(
    baseResume: Resume,
    targetJob: TargetJobJson,
    jobAnalysis: JobAnalysis,
    optimizedSummary: string,
    enhancedWorkExperience: WorkExperience[],
    optimizedSkills: SkillCategory[],
    keywords: string[]
  ): Promise<Resume>
  ```

- [ ] **Simplify** `generateResumeWithSteps()`:
  ```typescript
  async generateResumeWithSteps(input: ResumeGenerationInput): Promise<DataTransformationResult> {
    const { baseResume, targetJob } = input;

    // Remove all this conditional logic:
    // ❌ let workExperience = currentResume?.workExperience || [];
    // ❌ let skills = currentResume?.skills || [];
    // ❌ if (!currentResume || workExperience.length === 0 || skills.length === 0) {
    // ❌   const extractedData = await this.extractPersonData(person, targetJob);
    // ❌   ...
    // ❌ }

    // New clean flow:
    const workExperience = baseResume.workExperience;
    const skills = baseResume.skills;

    // Step 1: Analyze job
    const jobAnalysis = await this.analyzeJobRequirements(targetJob);

    // Step 2: Extract keywords
    const keywords = await this.extractKeywords(targetJob);

    // Step 3: Optimize summary
    const optimizedSummary = await this.optimizeSummary(baseResume, targetJob, jobAnalysis, keywords);

    // Step 4: Enhance work experience
    const enhancedWorkExperience = await this.enhanceWorkExperience(workExperience, targetJob, jobAnalysis, keywords);

    // Step 5: Optimize skills
    const optimizedSkills = await this.optimizeSkills(skills, targetJob, jobAnalysis, keywords);

    // Step 6: Generate final resume
    const resume = await this.generateResume(baseResume, targetJob, jobAnalysis, optimizedSummary, enhancedWorkExperience, optimizedSkills, keywords);

    return { resume, steps: { summaryOptimized: optimizedSummary, keywordsExtracted: keywords, achievementsEnhanced: enhancedWorkExperience } };
  }
  ```

#### 3.4 Update Cache Layer
**File:** `/src/services/langchain/cache.ts`
- [ ] Remove `extractPersonData()` cached method
- [ ] Update method signatures to match new base class

---

### Phase 4: Update UI Components

#### 4.1 Update Resume Generation Wizard
**File:** `/src/components/resumeGenerator/CreateResumeWizard.tsx`

Current flow:
```typescript
const result = await generateResumeAction({
  person,
  currentResume: undefined,  // ❌ Always undefined!
  targetJob
});
```

New flow:
```typescript
// Step 1: Get or create base resume for selected profile
let baseResume: Resume;
if (selectedProfileId) {
  const profile = ProfileStorageService.getProfileById(selectedProfileId);
  if (profile.baseResumeId) {
    baseResume = ResumeStorageService.getResumeById(profile.baseResumeId);
  } else {
    // Generate base resume if not exists
    baseResume = await generateBaseResumeAction(person);
    // Update profile with base resume ID
    const baseResumeId = ResumeStorageService.saveResumeById(baseResume);
    ProfileStorageService.updateProfile(selectedProfileId, { baseResumeId });
  }
}

// Step 2: Generate job-specific resume
const result = await generateResumeAction({
  baseResume,
  targetJob
});
```

- [ ] Update wizard steps to show base resume generation
- [ ] Add progress indicator for base resume creation
- [ ] Update form validation

#### 4.2 Update Data Manager
**File:** `/src/components/resumeGenerator/DataManager.tsx`
- [ ] Update `createGenerationInput()` to require base resume
- [ ] Load base resume from profile storage
- [ ] Show error if base resume doesn't exist

#### 4.3 Update Resume Generator Component
**File:** `/src/components/resumeGenerator/ResumeGenerator.tsx`
- [ ] Remove `currentResume: undefined` from generation call
- [ ] Load base resume before generation
- [ ] Update error handling

#### 4.4 Update Server Actions
**File:** `/src/app/actions/resumeGeneration.ts`
- [ ] Update `generateResumeAction()` parameter type
- [ ] Remove person-related logging
- [ ] Update to use baseResume

---

### Phase 5: Update Prompts for Base Resume

#### 5.1 Update Resume Generation Prompt
**File:** `/src/services/langchain/prompts.ts`

Current prompt uses:
```typescript
personName: personData.name,
personRawContent: personData.raw_content,
currentResume: currentResume ? JSON.stringify(currentResume) : 'No current resume'
```

New prompt should use:
```typescript
baseResume: JSON.stringify(baseResume, null, 2)
// Remove personName, personRawContent - all info is in baseResume
```

- [ ] Update `resumeGenerationPrompt` to use baseResume
- [ ] Update `summaryOptimizationPrompt` to use baseResume.summary
- [ ] Remove person-specific variables from all prompts

---

### Phase 6: Testing & Validation

#### 6.1 Create Test Script
**File:** `/scripts/langchain/test-base-resume-generation.ts`
- [ ] Test: Person → Base Resume conversion
- [ ] Test: Base Resume + Job → Optimized Resume
- [ ] Verify: All resume fields populated correctly
- [ ] Verify: Caching works as expected

#### 6.2 Update Existing Tests
**File:** `/scripts/langchain/test-generate-resume.ts`
- [ ] Update to use new two-phase flow
- [ ] Remove currentResume optional logic tests
- [ ] Add base resume generation tests

#### 6.3 Manual Testing Checklist
- [ ] Create new profile → verify base resume generated
- [ ] Generate resume for job → verify uses base resume
- [ ] Check cache hits for base resume
- [ ] Verify no errors in console
- [ ] Test with multiple profiles
- [ ] Test with same profile + different jobs

---

### Phase 7: Cleanup

#### 7.1 Remove Deprecated Code
- [ ] Remove unused personDataExtraction chain/prompt/schema
- [ ] Remove conditional resume logic from all files
- [ ] Remove `currentResume?` optional parameters

#### 7.2 Update Documentation
- [ ] Update README.md with new flow
- [ ] Update WIZARD_IMPLEMENTATION.md
- [ ] Add comments explaining two-phase approach

#### 7.3 Update Types & Interfaces
- [ ] Remove `Person` from ResumeGenerationInput
- [ ] Add `baseResumeId` to SavedProfile
- [ ] Update all type imports

---

## Data Flow Diagram

### Current (Complex):
```
Person (raw_content)
    ↓
    ├─> Has currentResume?
    │   ├─> YES: Use currentResume data
    │   └─> NO: Extract from raw_content
    ↓
Job Analysis → Keywords → Optimize → Final Resume
```

### New (Simple):
```
Person (raw_content) → Base Resume (cached)
                            ↓
                    Base Resume + Target Job
                            ↓
          Job Analysis → Keywords → Optimize → Final Resume
```

---

## Key Benefits

1. **Reduced State Complexity**
   - No optional `currentResume`
   - Single data flow path
   - Resume is always required

2. **Better Caching**
   - Base resume cached per profile
   - Only regenerate when profile changes
   - Faster job-specific optimization

3. **Cleaner Code**
   - Remove conditional logic
   - Simpler method signatures
   - Easier to understand and maintain

4. **Better UX**
   - Clear two-step process
   - Base resume visible to user
   - Can review/edit base resume before job targeting

5. **Separation of Concerns**
   - Profile parsing (one-time)
   - Job optimization (repeatable)

---

## Migration Strategy

1. **Backward Compatibility** (temporary)
   - Keep old methods during transition
   - Add deprecation warnings
   - Migrate gradually

2. **Data Migration**
   - Existing profiles without base resume → generate on first use
   - Show migration progress to user
   - Don't break existing resumes

3. **Feature Flag** (optional)
   - `USE_BASE_RESUME_FLOW` flag
   - Test new flow with subset of users
   - Rollback if issues

---

## Success Metrics

- [ ] Code complexity reduced (fewer lines, less conditional logic)
- [ ] Cache hit rate improved for base resumes
- [ ] Generation time reduced (base resume cached)
- [ ] No regression in resume quality
- [ ] All tests passing
- [ ] Zero errors in production

---

## Timeline Estimate

- Phase 1: Create base resume pipeline (4-6 hours)
- Phase 2: Update profile creation (2-3 hours)
- Phase 3: Simplify generation pipeline (3-4 hours)
- Phase 4: Update UI components (4-5 hours)
- Phase 5: Update prompts (2-3 hours)
- Phase 6: Testing (3-4 hours)
- Phase 7: Cleanup (2-3 hours)

**Total: 20-28 hours**

