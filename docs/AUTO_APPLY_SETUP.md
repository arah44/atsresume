# Auto-Apply Setup Guide

This guide explains how to set up and use the Browserbase-powered auto-apply feature for automatic job applications.

## Prerequisites

1. **Browserbase Account**: Sign up at [browserbase.com](https://browserbase.com)
2. **API Keys**: You need either OpenAI or Anthropic API key
3. **Environment Variables**: Set up the required environment variables

## Environment Setup

Create a `.env.local` file in the project root with the following variables:

```bash
# Browserbase Configuration
BROWSERBASE_API_KEY=your_browserbase_api_key_here
BROWSERBASE_PROJECT_ID=your_project_id_here

# LLM Provider (choose one)
OPENAI_API_KEY=your_openai_api_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## How It Works

The auto-apply feature uses Browserbase Stagehand to:

1. **Navigate** to the job application page
2. **Analyze** the form fields using AI
3. **Fill** the form with data from your profile and generated resume
4. **Preview** the filled form for your review
5. **Submit** the application after your confirmation

### Architecture

```
User Profile + Resume Data
    ↓
FieldMapper (maps data to form fields)
    ↓
JobApplicationService (Stagehand automation)
    ↓
Form Preview (user confirmation)
    ↓
Submit Application
    ↓
Track Application Status
```

## Using Auto-Apply

### Step 1: Complete Your Profile

Before using auto-apply, ensure you have:

1. **Created a profile** with your basic information
2. **Generated a base resume** from your profile
3. **Saved a job** you want to apply to
4. **Generated a tailored resume** for that specific job

### Step 2: Auto-Apply to a Job

1. Navigate to **Dashboard → Jobs**
2. Click on a job to view details
3. If the job has an `apply_url`, you'll see the **"Auto-Apply"** button
4. Click **"Auto-Apply"** to start the process

### Step 3: Handle Unknown Questions

If the application form has questions not in your profile:

1. A dialog will appear asking for the missing information
2. Fill in the required information
3. Click **"Save & Continue"**
4. Your answers are saved to your profile for future applications

### Step 4: Review and Confirm

1. Review the **Application Preview** modal
2. Check all filled fields for accuracy
3. View the screenshot of the filled form (optional)
4. Click **"Confirm & Submit"** to proceed

### Step 5: Submission

The system will:
- Submit the application automatically
- Track the submission status
- Show a success or error message
- Mark the job as "Applied"

## Field Mapping

The system automatically maps your profile data to common form fields:

| Form Field | Data Source |
|------------|-------------|
| Name | Profile name |
| Email | Profile email or extracted from raw_content |
| Phone | Profile phone or extracted from raw_content |
| Resume/CV | Generated resume (auto-upload) |
| Cover Letter | Resume summary |
| LinkedIn | Social media links from resume |
| Website/Portfolio | Social media links from resume |
| Custom Questions | Saved in `additional_details` |

## Additional Details

When you answer new questions during auto-apply, they're saved to your profile as `additional_details`:

```typescript
{
  question: "Are you authorized to work in the US?",
  answer: "Yes",
  field_type: "boolean",
  timestamp: 1234567890
}
```

These answers are automatically used for future applications with similar questions.

## Troubleshooting

### Auto-Apply Button Not Showing

**Possible reasons:**
- Job has no `apply_url`
- No resume generated for this job
- Already applied to this job

**Solution:**
1. Ensure the job has an application URL
2. Generate a tailored resume for the job first
3. Check if you've already applied

### "Unknown Field" Errors

**Reason:** The form has a field we can't map automatically

**Solution:**
1. Fill in the requested information when prompted
2. The answer will be saved for future use

### Submission Failed

**Possible causes:**
- Form structure changed
- Required field not filled
- Captcha or verification required
- Network issues

**Solution:**
1. Click "Apply Manually" to complete the application
2. Report the issue for improvement

### Session Timeout

**Reason:** Browserbase session expired

**Solution:**
1. The session is created fresh for each auto-apply
2. If it fails, try again or use manual application

## Supported Application Types

✅ **Supported:**
- Company career page forms
- Standard application forms
- Multi-step application wizards

❌ **Not Supported:**
- LinkedIn Easy Apply (may trigger bot detection)
- Forms with heavy CAPTCHA
- Video/audio interview requirements
- Applications requiring file uploads beyond resume

## Best Practices

1. **Review Before Submitting**: Always review the preview before confirming
2. **Keep Profile Updated**: Regularly update your profile information
3. **Save Common Answers**: Answer new questions thoughtfully; they'll be reused
4. **Check Applied Jobs**: Monitor your applications in the dashboard
5. **Fallback to Manual**: If auto-apply fails, use "Apply Manually"

## Privacy & Security

- **No Data Sharing**: Your data stays in your browser's local storage
- **Secure Sessions**: Browserbase sessions are encrypted
- **API Keys**: Never commit API keys to version control
- **Variable Protection**: Sensitive data is passed via secure variables

## API Usage & Costs

### Browserbase Costs
- Session-based pricing
- Each auto-apply creates one session
- Check [Browserbase pricing](https://browserbase.com/pricing) for details

### LLM Costs
- OpenAI GPT-4o or Anthropic Claude Sonnet
- Approx. 5,000-15,000 tokens per application
- Varies based on form complexity

## Development

### File Structure

```
src/
├── services/
│   ├── browserbase/
│   │   ├── BaseStagehandService.ts    # Base class for Stagehand
│   │   ├── FieldMapper.ts             # Maps profile → form fields
│   │   └── JobApplicationService.ts   # Main auto-apply logic
│   └── applicationStorage.ts          # Application tracking
├── components/
│   └── jobApplication/
│       ├── ApplicationPreviewModal.tsx
│       ├── ApplicationProgress.tsx
│       └── NewQuestionDialog.tsx
└── app/
    └── actions/
        └── jobApplication.ts          # Server actions
```

### Adding New Field Mappings

Edit `src/services/browserbase/FieldMapper.ts`:

```typescript
// Add new field type detection
private isCustomField(label: string): boolean {
  const patterns = ['custom', 'special'];
  return patterns.some(pattern => label.includes(pattern));
}

// Add new field mapper
private mapCustomField(): MappedField {
  return {
    value: this.userData.profile.customField || '',
    source: 'profile',
    confidence: 'high'
  };
}
```

### Debugging

Enable verbose logging:

```typescript
await service.initSession({
  verbose: 2  // 0=none, 1=basic, 2=detailed
});
```

## Roadmap

Future enhancements:
- [ ] Batch auto-apply for multiple jobs
- [ ] Application templates per company
- [ ] Analytics dashboard
- [ ] Resume file auto-upload
- [ ] Cover letter generation
- [ ] Application status tracking
- [ ] Email confirmation parsing

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review error messages in browser console
3. Check Browserbase session logs
4. Open an issue in the repository

## License

This feature uses:
- Browserbase Stagehand (MIT License)
- OpenAI/Anthropic APIs (respective terms apply)

