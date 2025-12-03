'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FormularioReconvencionProps {
  procesoId: string;
  onSuccess: () => void;
}

export function FormularioReconvencion({ procesoId, onSuccess }: FormularioReconvencionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formulario, setFormulario] = useState({
    objetoReconvencion: '',
    hechosReconvencion: '',
    derechoReconvencion: '',
    petitorioReconvencion: '',
    valorReconvencion: '',
    ofrecimientoPrueba: '',
  });

  const handleSubmit = async () => {
    // Validaciones
    if (
      !formulario.objetoReconvencion ||
      !formulario.hechosReconvencion ||
      !formulario.derechoReconvencion ||
      !formulario.petitorioReconvencion ||
      !formulario.valorReconvencion
    ) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    const valor = parseFloat(formulario.valorReconvencion);
    if (isNaN(valor) || valor <= 0) {
      toast({
        title: 'Error',
        description: 'El valor de la reconvención debe ser un número válido',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const reconvencion = {
        objetoReconvencion: formulario.objetoReconvencion,
        hechosReconvencion: formulario.hechosReconvencion,
        derechoReconvencion: formulario.derechoReconvencion,
        petitorioReconvencion: formulario.petitorioReconvencion,
        valorReconvencion: valor,
        ofrecimientoPrueba: formulario.ofrecimientoPrueba,
      };

      const response = await fetch('/api/contestaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procesoId,
          tipoContestacion: 'RECONVENCION',
          reconvencion,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al presentar reconvención');
      }

      toast({
        title: 'Reconvención presentada',
        description:
          'La reconvención ha sido registrada. El actor tendrá 30 días para contestar.',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo presentar la reconvención',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Requisitos de la Reconvención</AlertTitle>
        <AlertDescription>
          La reconvención debe cumplir los mismos requisitos que una demanda ordinaria (Art. 110
          CPC). El demandante original tendrá un plazo de 30 días hábiles para contestar la
          reconvención.
        </AlertDescription>
      </Alert>

      {/* Objeto de la Reconvención */}
      <div>
        <Label htmlFor="objetoReconvencion">
          Objeto de la Reconvención <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="objetoReconvencion"
          placeholder="Describa claramente qué solicita mediante esta reconvención..."
          value={formulario.objetoReconvencion}
          onChange={(e) =>
            setFormulario({ ...formulario, objetoReconvencion: e.target.value })
          }
          className="min-h-[100px]"
        />
      </div>

      {/* Hechos */}
      <div>
        <Label htmlFor="hechosReconvencion">
          Hechos <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="hechosReconvencion"
          placeholder="Relate de manera clara, precisa y circunstanciada los hechos en que se funda la reconvención..."
          value={formulario.hechosReconvencion}
          onChange={(e) =>
            setFormulario({ ...formulario, hechosReconvencion: e.target.value })
          }
          className="min-h-[200px]"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Narre los hechos de forma cronológica y detallada
        </p>
      </div>

      {/* Fundamentos de Derecho */}
      <div>
        <Label htmlFor="derechoReconvencion">
          Fundamentos de Derecho <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="derechoReconvencion"
          placeholder="Cite las normas legales, doctrina y jurisprudencia que fundamentan su reconvención..."
          value={formulario.derechoReconvencion}
          onChange={(e) =>
            setFormulario({ ...formulario, derechoReconvencion: e.target.value })
          }
          className="min-h-[200px]"
        />
      </div>

      {/* Petitorio */}
      <div>
        <Label htmlFor="petitorioReconvencion">
          Petitorio <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="petitorioReconvencion"
          placeholder="Especifique claramente lo que solicita al tribunal..."
          value={formulario.petitorioReconvencion}
          onChange={(e) =>
            setFormulario({ ...formulario, petitorioReconvencion: e.target.value })
          }
          className="min-h-[150px]"
        />
      </div>

      {/* Valor Económico */}
      <div>
        <Label htmlFor="valorReconvencion">
          Valor de la Reconvención (Bs.) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="valorReconvencion"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formulario.valorReconvencion}
          onChange={(e) =>
            setFormulario({ ...formulario, valorReconvencion: e.target.value })
          }
        />
        <p className="text-xs text-muted-foreground mt-1">
          Indique el valor económico de lo reclamado en bolivianos
        </p>
      </div>

      {/* Ofrecimiento de Prueba */}
      <div>
        <Label htmlFor="ofrecimientoPrueba">Ofrecimiento de Prueba</Label>
        <Textarea
          id="ofrecimientoPrueba"
          placeholder="Liste y describa las pruebas que ofrece para respaldar la reconvención..."
          value={formulario.ofrecimientoPrueba}
          onChange={(e) =>
            setFormulario({ ...formulario, ofrecimientoPrueba: e.target.value })
          }
          className="min-h-[150px]"
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-900">
          <strong>Nota importante:</strong> La reconvención se tramitará conjuntamente con la
          demanda principal. Ambas acciones se resolverán en una misma sentencia. El actor deberá
          contestar la reconvención en el mismo plazo que usted tuvo para contestar la demanda
          original (30 días hábiles).
        </p>
      </div>

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
            'Presentar Reconvención'
          )}
        </Button>
      </div>
    </div>
  );
}
