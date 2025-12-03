'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FileUploadProps {
  procesoId: string;
  onUploadComplete?: (fileData: any) => void;
  maxSize?: number; // en bytes
  accept?: string[];
}

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
  hash?: string;
}

export function FileUpload({
  procesoId,
  onUploadComplete,
  maxSize = 50 * 1024 * 1024, // 50MB por defecto
  accept = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'text/plain',
  ],
}: FileUploadProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Validar archivos
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > maxSize) {
          toast({
            title: 'Error',
            description: `${file.name} supera el tamaño máximo de ${
              maxSize / 1024 / 1024
            }MB`,
            variant: 'destructive',
          });
          return false;
        }

        if (!accept.includes(file.type)) {
          toast({
            title: 'Error',
            description: `${file.name} no es un tipo de archivo permitido`,
            variant: 'destructive',
          });
          return false;
        }

        return true;
      });

      // Agregar archivos válidos a la lista
      const newFiles: UploadFile[] = validFiles.map((file) => ({
        file,
        progress: 0,
        status: 'pending',
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [maxSize, accept, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: true,
  });

  const uploadFile = async (uploadFile: UploadFile, index: number) => {
    try {
      // Actualizar estado a uploading
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: 'uploading', progress: 0 } : f
        )
      );

      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('procesoId', procesoId);

      // Simular progreso (XMLHttpRequest para seguimiento real)
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, progress } : f))
          );
        }
      });

      const response: any = await new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.statusText));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Error de red'));
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      // Actualizar estado a success
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: 'success',
                progress: 100,
                url: response.url,
                hash: response.contenidoHash,
              }
            : f
        )
      );

      if (onUploadComplete) {
        onUploadComplete({
          ...response,
          nombre: uploadFile.file.name,
        });
      }
    } catch (error: any) {
      console.error('Error al subir archivo:', error);
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: 'error',
                error: error.message || 'Error al subir archivo',
              }
            : f
        )
      );
    }
  };

  const handleUploadAll = async () => {
    setUploading(true);
    const pendingFiles = files.filter((f) => f.status === 'pending');

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending') {
        await uploadFile(files[i], i);
      }
    }

    setUploading(false);
    toast({
      title: 'Subida completa',
      description: `${pendingFiles.length} archivo(s) subido(s) correctamente`,
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status !== 'success'));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${
                isDragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload
              className={`mx-auto h-12 w-12 mb-4 ${
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
            {isDragActive ? (
              <p className="text-lg font-medium">Suelta los archivos aquí...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Arrastra y suelta archivos aquí
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Máximo {maxSize / 1024 / 1024}MB por archivo
                </p>
              </>
            )}
          </div>

          {files.length > 0 && (
            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleUploadAll}
                disabled={
                  uploading || files.every((f) => f.status !== 'pending')
                }
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir {files.filter((f) => f.status === 'pending').length}{' '}
                    archivo(s)
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={clearCompleted}>
                Limpiar completados
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadFile, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icono de estado */}
                  <div className="mt-1">
                    {uploadFile.status === 'pending' && (
                      <File className="h-5 w-5 text-muted-foreground" />
                    )}
                    {uploadFile.status === 'uploading' && (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    )}
                    {uploadFile.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {uploadFile.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>

                  {/* Información del archivo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={uploadFile.status === 'uploading'}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">
                      {formatFileSize(uploadFile.file.size)}
                    </p>

                    {/* Barra de progreso */}
                    {uploadFile.status === 'uploading' && (
                      <div className="space-y-1">
                        <Progress value={uploadFile.progress} />
                        <p className="text-xs text-muted-foreground text-right">
                          {uploadFile.progress}%
                        </p>
                      </div>
                    )}

                    {/* Mensaje de error */}
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription className="text-xs">
                          {uploadFile.error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Hash del archivo */}
                    {uploadFile.status === 'success' && uploadFile.hash && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Hash: {uploadFile.hash.substring(0, 16)}...
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
