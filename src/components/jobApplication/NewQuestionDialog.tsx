'use client';

import { useState } from 'react';
import { ApplicationDetail } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Save } from 'lucide-react';

interface NewQuestionPrompt {
  question: string;
  field_type: string;
  suggested_answer?: string;
}

interface NewQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: NewQuestionPrompt[];
  onSubmit: (answers: ApplicationDetail[]) => void;
}

export function NewQuestionDialog({
  open,
  onOpenChange,
  questions,
  onSubmit
}: NewQuestionDialogProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    questions.forEach(q => {
      initial[q.question] = q.suggested_answer || '';
    });
    return initial;
  });

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [question]: value
    }));
  };

  const handleSubmit = () => {
    const applicationDetails: ApplicationDetail[] = questions.map(q => ({
      question: q.question,
      answer: answers[q.question] || '',
      field_type: q.field_type as any,
      timestamp: Date.now()
    }));

    onSubmit(applicationDetails);
  };

  const isComplete = questions.every(q => answers[q.question]?.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Additional Information Required
          </DialogTitle>
          <DialogDescription>
            The application form requires some additional information that we don&apos;t have in your profile.
            Please provide answers below. These will be saved for future applications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {questions.map((question, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Label htmlFor={`question-${index}`} className="text-sm font-medium">
                  {question.question}
                </Label>
                <Badge variant="outline" className="text-xs shrink-0">
                  {question.field_type}
                </Badge>
              </div>

              {question.field_type === 'textarea' || question.question.length > 50 ? (
                <Textarea
                  id={`question-${index}`}
                  value={answers[question.question] || ''}
                  onChange={(e) => handleAnswerChange(question.question, e.target.value)}
                  placeholder="Enter your answer..."
                  rows={3}
                  className="resize-none"
                />
              ) : (
                <Input
                  id={`question-${index}`}
                  type={question.field_type === 'number' ? 'number' : 'text'}
                  value={answers[question.question] || ''}
                  onChange={(e) => handleAnswerChange(question.question, e.target.value)}
                  placeholder="Enter your answer..."
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!isComplete}
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

