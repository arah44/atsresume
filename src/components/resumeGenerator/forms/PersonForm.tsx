import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Person } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';

const personSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  raw_content: z.string().min(10, 'Raw content must be at least 10 characters')
});

type PersonFormData = z.infer<typeof personSchema>;

interface PersonFormProps {
  initialData: Person;
  onSubmit: (data: Person) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PersonForm: React.FC<PersonFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const form = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: initialData
  });

  const handleSubmit = (data: PersonFormData) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Person Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="raw_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raw Resume Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your complete resume content here (any format)..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Person Data'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};