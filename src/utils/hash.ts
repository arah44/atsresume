// create a hash function that takes a string and returns a hash
import { createHash } from 'crypto';

export function hash(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}