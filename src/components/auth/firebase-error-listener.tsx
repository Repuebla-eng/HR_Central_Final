// src/components/auth/firebase-error-listener.tsx
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import type { FirestorePermissionError } from '@/lib/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export default function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Log the detailed, original error to the console for debugging
      console.error("Original Firestore Error:", error); 

      // Show a user-friendly toast notification with the core information
      toast({
        variant: 'destructive',
        title: error.name, // e.g., "FirestorePermissionError"
        description: error.message, // The actual descriptive message
        duration: 10000, 
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
