import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Define the complexity type
export type Complexity = 'easy' | 'medium' | 'hard';

// Inappropriate content filter
const inappropriateWords = [
  'violence',
  'weapon',
  'drug',
  'alcohol',
  'sex',
  'sexual',
  'porn',
  'adult',
  'hate',
  'racism',
  'terrorist',
  'bomb',
  'kill',
  'death',
  'suicide',
  'gambling',
  'casino',
  'bet',
  'political',
  'religion',
  'religious',
];

// Valid grade levels
const validGradeLevels = [
  'K',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  'Kindergarten',
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  '7th',
  '8th',
  '9th',
  '10th',
  '11th',
  '12th',
  'Elementary',
  'Middle School',
  'High School',
];

// Content validation functions
const validateGradeLevel = (grade: string): boolean => {
  const normalizedGrade = grade.toLowerCase().trim();
  return validGradeLevels.some(
    validGrade =>
      validGrade.toLowerCase() === normalizedGrade ||
      validGrade.toLowerCase().includes(normalizedGrade)
  );
};

const validateTopicContent = (topic: string): { isValid: boolean; reason?: string } => {
  const lowerTopic = topic.toLowerCase();

  // Check for inappropriate content
  for (const word of inappropriateWords) {
    if (lowerTopic.includes(word)) {
      return {
        isValid: false,
        reason: `Topic contains inappropriate content: "${word}". Please choose an educational topic suitable for students.`,
      };
    }
  }

  // Check if topic is too generic or empty
  if (topic.trim().length < 3) {
    return {
      isValid: false,
      reason: 'Topic must be at least 3 characters long and descriptive.',
    };
  }

  // Check for potential spam patterns
  if (/(.)\1{4,}/.test(topic)) {
    // Repeated characters
    return {
      isValid: false,
      reason: 'Topic appears to contain spam-like content.',
    };
  }

  return { isValid: true };
};

// Enhanced input validation schema
export const worksheetRequestSchema = z
  .object({
    gradeLevel: z
      .string()
      .min(1, 'Grade level is required')
      .max(20, 'Grade level must be 20 characters or less')
      .refine(validateGradeLevel, {
        message:
          'Invalid grade level. Please use K-12, Kindergarten-12th, Elementary, Middle School, or High School.',
      }),
    topic: z
      .string()
      .min(3, 'Topic must be at least 3 characters long')
      .max(100, 'Topic must be 100 characters or less')
      .refine(topic => validateTopicContent(topic).isValid, {
        message: 'Topic contains inappropriate or invalid content',
      }),
    complexity: z.enum(['easy', 'medium', 'hard']).optional(),
  })
  .strict(); // Reject any additional properties

// Extract the inferred type from the schema
export type WorksheetRequest = z.infer<typeof worksheetRequestSchema>;

export const validateWorksheetRequest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Additional content validation for detailed error messages
    if (req.body.topic) {
      const topicValidation = validateTopicContent(req.body.topic);
      if (!topicValidation.isValid) {
        res.status(400).json({
          error: 'Invalid topic content',
          message: topicValidation.reason,
          field: 'topic',
        });
        return;
      }
    }

    // Zod validation
    const validatedData = worksheetRequestSchema.parse(req.body);

    // Store validated data for use in controller
    req.body = validatedData;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      res.status(400).json({
        error: 'Invalid request data',
        message: firstError.message,
        field: firstError.path.join('.'),
        details: error.errors,
      });
    } else {
      res.status(400).json({
        error: 'Invalid request data',
        message: 'Unknown validation error',
      });
    }
  }
};
