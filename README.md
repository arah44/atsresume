# ATSResume

A cutting-edge AI-powered resume builder that helps job seekers create tailored, ATS-optimized resumes for every job application. Upload your resume or paste your content once, then generate customized versions for each role using advanced AI.

## Features

- 🤖 **AI-Powered Resume Generation** - Automatically structure and optimize your resume
- 📄 **PDF Upload Support** - Upload your existing resume and let AI extract everything
- 🎯 **Job-Specific Tailoring** - Generate customized resumes for each job posting
- ✅ **ATS-Optimized** - Pass applicant tracking systems with keyword optimization
- 🚀 **Fast & Easy** - Create your profile once, generate unlimited tailored resumes

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# OpenRouter API Key (for resume generation)
OPENROUTER_API_KEY=your_openrouter_key_here

# OpenAI API Key (for PDF parsing)
OPENAI_API_KEY=your_openai_key_here
```

### Getting API Keys

- **OpenRouter**: Get your key at [https://openrouter.ai/keys](https://openrouter.ai/keys)
- **OpenAI**: Get your key at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

## Quick Start

```bash
# Install dependencies
bun install

# Add environment variables
cp .env.example .env
# Edit .env and add your API keys

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and start building!

## Demo

#### [https://atsresume.vercel.app/](https://atsresume.vercel.app/)
![image](https://user-images.githubusercontent.com/61316762/218017511-fbbaa7da-6154-449f-9e46-8de45b0e6c29.png)

### Resume Score
#### https://www.resumego.net/resume-checker/
![image](https://user-images.githubusercontent.com/61316762/218143206-f0e5e764-52bc-4c25-84f2-6b2fff00cd4b.png)

## Change Log

- Drag and drop sections to reorder them in the resume(Work Experience, Projects, Skills)

## Sections

- [Personal Information](#personal-information)
- [Social Media](#social-media)
- [Summary](#summary)
- [Educations](#education)
- [Work Experience](#work-experience)
- [Projects](#projects)
- [Technical Skills](#technical-skills)
- [Soft Skills](#soft-skills)
- [Languages](#languages)
- [Additional Skills](#additional-skills)
- [Certifications](#certifications)

## Personal Information

- Name
- Email
- Phone
- Address
- Profile Picture

## Social Media

- Social Media Links

## Summary

- Summary

## Educations

- Degree
- Institute
- Start Date
- End Date

## Work Experience

- Company
- Designation
- Description
- Key Achievements
- Start Date
- End Date

Description optional

## Projects

- Project Name
- Description
- key Achievements
- Start Date
- End Date

Description optional

## Technical Skills

- Technical Skills

## Soft Skills

- Soft Skills

## Languages

- Languages

## Additional Skills

- Additional Skills

## Certifications

- Certifications

## How to Add Key Achievements

Key achievements are the most important part of your resume.

- Add key achievements to your resume to make it more attractive and increase your chances of getting noticed by employers.
- Add key achievements to your work experience and projects.
- Add key achievements to your resume by clicking on the new line.

## PageSpeed Insights

![image](https://user-images.githubusercontent.com/61316762/218244257-e85172dc-46bd-4f4b-b9c2-9bd17c693cc8.png)

![image](https://user-images.githubusercontent.com/61316762/218244267-c46f5d02-b742-4b4c-ba7e-ae1bfb1e04d4.png)

## License

[MIT](https://github.com/sauravhathi/atsresume/blob/main/LICENSE.md)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Authors and acknowledgment

- [Saurav Hathi](https://github.com/sauravhathi)
