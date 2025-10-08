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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface AddDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (detail: ApplicationDetail) => void;
}

export function AddDetailDialog({ open, onOpenChange, onAdd }: AddDetailDialogProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'select' | 'boolean' | 'date' | 'number'>('text');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) {
      return;
    }

    const newDetail: ApplicationDetail = {
      question: question.trim(),
      answer: answer.trim(),
      field_type: fieldType,
      timestamp: Date.now()
    };

    onAdd(newDetail);

    // Reset form
    setQuestion('');
    setAnswer('');
    setFieldType('text');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setQuestion('');
    setAnswer('');
    setFieldType('text');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Application Detail
          </DialogTitle>
          <DialogDescription>
            Add a custom question and answer that will be auto-filled in future job applications.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Are you authorized to work in the US?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-type">Field Type</Label>
            <Select value={fieldType} onValueChange={(value: any) => setFieldType(value)}>
              <SelectTrigger id="field-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Yes/No</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="select">Select/Dropdown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            {fieldType === 'boolean' ? (
              <Select value={answer} onValueChange={setAnswer}>
                <SelectTrigger id="answer">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            ) : fieldType === 'text' || fieldType === 'select' ? (
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                rows={3}
                required
              />
            ) : (
              <Input
                id="answer"
                type={fieldType === 'date' ? 'date' : fieldType === 'number' ? 'number' : 'text'}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                required
              />
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!question.trim() || !answer.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Detail
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

