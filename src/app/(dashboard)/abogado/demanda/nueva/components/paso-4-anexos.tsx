'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Upload, FileText, X } from 'lucide-react';
import { DemandaFormData } from '../page';
import { useToast } from '@/components/ui/toast';

interface Props {
  datos: Partial<DemandaFormData>;
  onSiguiente: (datos: Partial<DemandaFormData>) => void;
  onAnterior: () => void;
}

export function Paso4Anexos({ datos, onSiguiente, onAnterior }: Props) {
  const { toast } = useToast();
  const [anexos, setAnexos] = useState<DemandaFormData['anexos']>(datos.anexos || []);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Validar tamaño (50MB máx)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: 'Archivo muy grande',
            description: `${file.name} excede el límite de 50MB`,
            variant: 'destructive',
          });
          continue;
        }

        // Validar tipo PDF
        if (file.type !== 'application/pdf') {
          toast({
            title: 'Formato inválido',
            description: 'Solo se permiten archivos PDF',
            variant: 'destructive',
          });
          continue;
        }

        // Generar hash SHA-256 (simplificado - en producción usar crypto API)
        const hash = await generateFileHash(file);

        // Aquí iría la subida real a Supabase Storage
        // Por ahora simulamos la URL
        const url = `https://storage.example.com/${file.name}`;

        const nuevoAnexo = {
          nombre: file.name,
          url,
          tipo: file.type,
          size: file.size,
          hash,
        };

        setAnexos((prev) => [...prev, nuevoAnexo]);
      }

      toast({
        title: 'Archivos cargados',
        description: `${files.length} archivo(s) agregado(s) exitosamente`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los archivos',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const generateFileHash = async (file: File): Promise<string> => {
    // Implementación simplificada - en producción usar Web Crypto API
    return `hash-${file.name}-${Date.now()}`;
  };

  const eliminarAnexo = (index: number) => {
    setAnexos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSiguiente = () => {
    onSiguiente({ anexos });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">Cargar Documentos Probatorios</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Solo archivos PDF, máximo 50MB por archivo
        </p>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <label htmlFor="file-upload">
          <Button type="button" disabled={uploading} asChild>
            <span>
              {uploading ? 'Cargando...' : 'Seleccionar archivos'}
            </span>
          </Button>
        </label>
      </div>

      {anexos.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Archivos adjuntos ({anexos.length})</h4>
          {anexos.map((anexo, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-medium">{anexo.nombre}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatBytes(anexo.size)}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => eliminarAnexo(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-muted p-4 rounded-lg text-sm">
        <p className="font-semibold mb-2">Nota:</p>
        <p>
          Es recomendable adjuntar todos los documentos probatorios al momento de
          presentar la demanda (Art. 110 inc. 9). Los anexos pueden incluir:
          contratos, recibos, certificados, etc.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onAnterior}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
        </Button>
        <Button onClick={handleSiguiente}>
          Siguiente <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
