'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Loader2, Upload, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FormularioContestacionProps {
  procesoId: string;
  demanda: {
    hechos: string;
    derecho: string;
    petitorio: string;
  };
  onSuccess: () => void;
}

export function FormularioContestacion({
  procesoId,
  demanda,
  onSuccess,
}: FormularioContestacionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formulario, setFormulario] = useState({
    contestacionHechos: '',
    contestacionDerecho: '',
    contestacionPetitorio: '',
    ofrecimientoPrueba: '',
  });
  const [anexos, setAnexos] = useState<File[]>([]);

  const handleSubmit = async () => {
    // Validaciones
    if (
      !formulario.contestacionHechos ||
      !formulario.contestacionDerecho ||
      !formulario.contestacionPetitorio
    ) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const contenido = {
        contestacionHechos: formulario.contestacionHechos,
        contestacionDerecho: formulario.contestacionDerecho,
        contestacionPetitorio: formulario.contestacionPetitorio,
        ofrecimientoPrueba: formulario.ofrecimientoPrueba,
        demandaOriginal: {
          hechos: demanda.hechos,
          derecho: demanda.derecho,
          petitorio: demanda.petitorio,
        },
      };

      const response = await fetch('/api/contestaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procesoId,
          tipoContestacion: 'CONTESTAR',
          contenido: JSON.stringify(contenido),
          anexos: [], // TODO: implementar upload
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al presentar contestación');
      }

      toast({
        title: 'Contestación presentada',
        description: 'La contestación ha sido registrada exitosamente',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo presentar la contestación',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAnexos(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setAnexos(anexos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Contestación a los Hechos */}
      <div>
        <Label htmlFor="contestacionHechos">
          Contestación a los Hechos <span className="text-red-500">*</span>
        </Label>
        <div className="mb-2 mt-1 p-3 bg-muted rounded text-sm">
          <p className="font-semibold mb-1">Hechos de la demanda:</p>
          <p className="text-muted-foreground line-clamp-3">{demanda.hechos}</p>
        </div>
        <Textarea
          id="contestacionHechos"
          placeholder="Responda punto por punto a los hechos alegados por el demandante. Admita los que sean ciertos y contradiga los que sean falsos, fundamentando su posición..."
          value={formulario.contestacionHechos}
          onChange={(e) =>
            setFormulario({ ...formulario, contestacionHechos: e.target.value })
          }
          className="min-h-[200px]"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Debe responder específicamente a cada hecho alegado
        </p>
      </div>

      {/* Contestación al Derecho */}
      <div>
        <Label htmlFor="contestacionDerecho">
          Fundamentos de Derecho <span className="text-red-500">*</span>
        </Label>
        <div className="mb-2 mt-1 p-3 bg-muted rounded text-sm">
          <p className="font-semibold mb-1">Derecho invocado por el demandante:</p>
          <p className="text-muted-foreground line-clamp-3">{demanda.derecho}</p>
        </div>
        <Textarea
          id="contestacionDerecho"
          placeholder="Cite las normas legales, doctrina y jurisprudencia que respaldan su contestación..."
          value={formulario.contestacionDerecho}
          onChange={(e) =>
            setFormulario({ ...formulario, contestacionDerecho: e.target.value })
          }
          className="min-h-[200px]"
        />
      </div>

      {/* Contestación al Petitorio */}
      <div>
        <Label htmlFor="contestacionPetitorio">
          Petitorio <span className="text-red-500">*</span>
        </Label>
        <div className="mb-2 mt-1 p-3 bg-muted rounded text-sm">
          <p className="font-semibold mb-1">Petitorio del demandante:</p>
          <p className="text-muted-foreground line-clamp-3">{demanda.petitorio}</p>
        </div>
        <Textarea
          id="contestacionPetitorio"
          placeholder="Solicite al tribunal que rechace la demanda, con las fundamentaciones correspondientes..."
          value={formulario.contestacionPetitorio}
          onChange={(e) =>
            setFormulario({ ...formulario, contestacionPetitorio: e.target.value })
          }
          className="min-h-[150px]"
        />
      </div>

      {/* Ofrecimiento de Prueba */}
      <div>
        <Label htmlFor="ofrecimientoPrueba">Ofrecimiento de Prueba</Label>
        <Textarea
          id="ofrecimientoPrueba"
          placeholder="Liste y describa las pruebas que ofrece (documentales, testimoniales, periciales, etc.)..."
          value={formulario.ofrecimientoPrueba}
          onChange={(e) =>
            setFormulario({ ...formulario, ofrecimientoPrueba: e.target.value })
          }
          className="min-h-[150px]"
        />
      </div>

      {/* Anexos */}
      <div>
        <Label htmlFor="anexos">Documentos Anexos</Label>
        <div className="mt-2">
          <Input
            id="anexos"
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Adjunte los documentos probatorios en formato PDF (máx. 50MB por archivo)
          </p>
        </div>

        {anexos.length > 0 && (
          <div className="mt-3 space-y-2">
            {anexos.map((file, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" disabled={loading}>
          Guardar Borrador
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Presentando...
            </>
          ) : (
            'Presentar Contestación'
          )}
        </Button>
      </div>
    </div>
  );
}
