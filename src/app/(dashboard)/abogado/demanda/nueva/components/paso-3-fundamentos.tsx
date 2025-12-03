'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DemandaFormData } from '../page';

const formSchema = z.object({
  hechos: z.string().min(100, 'Los hechos deben ser detallados (mín. 100 caracteres)'),
  derecho: z.string().min(50, 'Los fundamentos de derecho deben citar normas legales (mín. 50 caracteres)'),
  petitorio: z.string().min(30, 'El petitorio debe ser claro y preciso (mín. 30 caracteres)'),
  ofrecimientoPrueba: z.string().min(20, 'Debe ofrecer prueba (mín. 20 caracteres)'),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  datos: Partial<DemandaFormData>;
  onSiguiente: (datos: Partial<DemandaFormData>) => void;
  onAnterior: () => void;
}

export function Paso3Fundamentos({ datos, onSiguiente, onAnterior }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hechos: datos.hechos || '',
      derecho: datos.derecho || '',
      petitorio: datos.petitorio || '',
      ofrecimientoPrueba: datos.ofrecimientoPrueba || '',
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
          name="hechos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hechos en que se Funda*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Exponga de manera clara, precisa y cronológica los hechos que fundamentan la demanda..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Art. 110 inc. 5 - Exposición de hechos</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="derecho"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fundamentos de Derecho*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Cite las normas legales, artículos y jurisprudencia aplicables al caso..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Art. 110 inc. 6 - Citar normas legales</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="petitorio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Petitorio*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Por lo expuesto, solicito al tribunal:\n1. ...\n2. ...\n3. ..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Art. 110 inc. 7 - Petición clara y precisa</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ofrecimientoPrueba"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ofrecimiento de Prueba*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ofrezco como prueba:\n- Documental: ...\n- Testimonial: ...\n- Pericial: ..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Art. 110 inc. 9</FormDescription>
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
