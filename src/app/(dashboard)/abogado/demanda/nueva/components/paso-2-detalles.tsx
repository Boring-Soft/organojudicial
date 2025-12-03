'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DemandaFormData } from '../page';

const formSchema = z.object({
  designacionJuez: z.string().min(1, 'Debe designar el juez o tribunal'),
  objetoDemanda: z.string().min(20, 'El objeto debe ser detallado (mín. 20 caracteres)'),
  materia: z.string().min(1, 'La materia es requerida'),
  juzgado: z.string().min(1, 'El juzgado es requerido'),
  valor: z.coerce.number().min(1, 'El valor debe ser mayor a 0'),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  datos: Partial<DemandaFormData>;
  onSiguiente: (datos: Partial<DemandaFormData>) => void;
  onAnterior: () => void;
}

export function Paso2Detalles({ datos, onSiguiente, onAnterior }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      designacionJuez: datos.designacionJuez || '',
      objetoDemanda: datos.objetoDemanda || '',
      materia: datos.materia || '',
      juzgado: datos.juzgado || '',
      valor: datos.valor || 0,
    },
  });

  const onSubmit = (data: FormData) => {
    onSiguiente(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="designacionJuez"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designación del Juez o Tribunal*</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Juez Público Civil y Comercial N° 1" {...field} />
              </FormControl>
              <FormDescription>Art. 110 inc. 1</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="materia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Materia*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CIVIL">Civil</SelectItem>
                    <SelectItem value="PENAL">Penal</SelectItem>
                    <SelectItem value="LABORAL">Laboral</SelectItem>
                    <SelectItem value="FAMILIAR">Familiar</SelectItem>
                    <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                    <SelectItem value="TRIBUTARIO">Tributario</SelectItem>
                    <SelectItem value="COMERCIAL">Comercial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="juzgado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Juzgado*</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Juzgado 1ro de Partido La Paz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="objetoDemanda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objeto de la Demanda*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa de forma clara el objeto de la demanda..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Art. 110 inc. 4 - Especifique con claridad</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor de la Demanda (Bs.)*</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="10000.00" {...field} />
              </FormControl>
              <FormDescription>Art. 110 inc. 8</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onAnterior}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
          </Button>
          <Button type="submit">
            Siguiente <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
