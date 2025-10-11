import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";
import { getLLM } from "./core";
import {
  jobDataExtractionPrompt,
  profileToBaseResumePrompt,
  jobAnalysisPrompt,
  keywordExtractionPrompt,
  resumeOptimizationPrompt
} from "./prompts";
import {
  jobDataExtractionSchema,
  profileToBaseResumeSchema,
  jobAnalysisSchema,
  keywordsSchema,
  resumeSchema
} from "./schemas";

// Chain: Job Data Extraction
// Extracts structured job information from raw job posting content
export const createJobDataExtractionChain = () => {
  const parser = StructuredOutputParser.fromZodSchema(jobDataExtractionSchema as any);
  return RunnableSequence.from([
    jobDataExtractionPrompt,
    getLLM(),
    parser
  ]);
};

// Export parser for format instructions
export const jobDataExtractionParser = StructuredOutputParser.fromZodSchema(jobDataExtractionSchema as any);

// Chain 0: Profile to Base Resume Conversion
// Converts Person's raw_content into a complete structured base resume
export const createProfileToBaseResumeChain = () => {
  const parser = StructuredOutputParser.fromZodSchema(profileToBaseResumeSchema as any);
  return RunnableSequence.from([
    profileToBaseResumePrompt,
    getLLM(),
    parser
  ]);
};

// Export parser for format instructions
export const profileToBaseResumeParser = StructuredOutputParser.fromZodSchema(profileToBaseResumeSchema as any);

// Chain 1: Job Requirements Analysis
// Uses StructuredOutputParser with format instructions for reliable parsing
export const createJobAnalysisChain = () => {
  const parser = StructuredOutputParser.fromZodSchema(jobAnalysisSchema as any);
  return RunnableSequence.from([
    jobAnalysisPrompt,
    getLLM(),
    parser
  ]);
};

// Export parser for format instructions
export const jobAnalysisParser = StructuredOutputParser.fromZodSchema(jobAnalysisSchema as any);

// Chain 2: Keyword Extraction
// Uses StructuredOutputParser for arrays
export const createKeywordExtractionChain = () => {
  const parser = StructuredOutputParser.fromZodSchema(keywordsSchema as any);
  return RunnableSequence.from([
    keywordExtractionPrompt,
    getLLM(),
    parser
  ]);
};

// Export parser for format instructions
export const keywordsParser = StructuredOutputParser.fromZodSchema(keywordsSchema as any);

// Chain 3: Single-Shot Resume Optimization
// Generates complete optimized resume in one coherent pass
export const createResumeOptimizationChain = () => {
  const parser = StructuredOutputParser.fromZodSchema(resumeSchema as any);
  return RunnableSequence.from([
    resumeOptimizationPrompt,
    getLLM(),
    parser
  ]);
};

// Export parser for format instructions
export const resumeOptimizationParser = StructuredOutputParser.fromZodSchema(resumeSchema as any);

// Export chain factories
export const jobDataExtractionChain = createJobDataExtractionChain;
export const profileToBaseResumeChain = createProfileToBaseResumeChain;
export const jobAnalysisChain = createJobAnalysisChain;
export const keywordExtractionChain = createKeywordExtractionChain;
export const resumeOptimizationChain = createResumeOptimizationChain;

