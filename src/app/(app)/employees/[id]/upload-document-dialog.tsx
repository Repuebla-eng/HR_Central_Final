// src/app/(app)/employees/[id]/upload-document-dialog.tsx
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { uploadFileToDrive } from '../drive-actions';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Upload, CalendarIcon, FileUp, LinkIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  name: z.string().min(3, { message: 'Document name must be at least 3 characters.' }),
  url: z.string().optional(),
  expiresAt: z.date().optional(),
});

interface UploadDocumentDialogProps {
    employeeId: string;
    disabled?: boolean;
    onDocumentUploaded: () => void;
}

export default function UploadDocumentDialog({ employeeId, disabled, onDocumentUploaded }: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"file" | "link">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      url: '',
      expiresAt: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      let finalUrl = values.url;

      if (uploadMethod === 'file') {
        if (!selectedFile) {
          toast({
            variant: 'destructive',
            title: 'No file selected',
            description: 'Please select a file to upload.',
          });
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResult = await uploadFileToDrive(formData);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload to Google Drive');
        }
        finalUrl = uploadResult.url ?? undefined;
      }

      if (!finalUrl) {
          throw new Error('No URL provided for the document');
      }

      await addDoc(collection(db, 'employees', employeeId, 'documents'), {
          name: values.name,
          url: finalUrl,
          uploadedAt: serverTimestamp(),
          expiresAt: values.expiresAt ? Timestamp.fromDate(values.expiresAt) : null,
      });
      
      toast({
        title: 'Success',
        description: uploadMethod === 'file' ? 'File uploaded and saved successfully.' : 'Document link has been saved.',
      });
      
      onDocumentUploaded();
      handleOpenChange(false);
    } catch (error: any) {
      console.error('Error saving document:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save the document.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if(disabled) return;
    if (!isOpen) {
      form.reset();
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild disabled={disabled}>
        <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            Upload a file to Google Drive or provide an external link.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as "file" | "link")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Direct Upload
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              External Link
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Medical Certificate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TabsContent value="file" className="mt-0 space-y-4">
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                        if (file && !form.getValues('name')) {
                          form.setValue('name', file.name.split('.')[0]);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The file will be automatically saved in the REPOSITORIO folder.
                  </FormDescription>
                </FormItem>
              </TabsContent>

              <TabsContent value="link" className="mt-0 space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://docs.google.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expires On (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6">
                  <DialogClose asChild>
                      <Button type="button" variant="secondary" disabled={loading}>
                          Cancel
                      </Button>
                  </DialogClose>
                  <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading ? (uploadMethod === 'file' ? 'Uploading...' : 'Saving...') : 'Confirm'}
                  </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

