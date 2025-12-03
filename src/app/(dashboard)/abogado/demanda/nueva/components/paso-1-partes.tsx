'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight } from 'lucide-react';
import { DemandaFormData } from '../page';

const formSchema = z.object({
  demandante: z.object({
    ci: z.string().min(1, 'El CI es requerido').regex(/^\d{5,9}-(LP|CB|SC|OR|PT|CH|TJ|BE|PD)$/, 'Formato: 12345678-LP'),
    nombres: z.string().min(2, 'Los nombres son requeridos'),
    apellidos: z.string().min(2, 'Los apellidos son requeridos'),
    edad: z.coerce.number().min(18, 'Debe ser mayor de edad').max(120),
    estadoCivil: z.string().min(1, 'El estado civil es requerido'),
    profesion: z.string().min(1, 'La profesión es requerida'),
    domicilioReal: z.string().min(10, 'El domicilio real es requerido'),
    domicilioProcesal: z.string().min(10, 'El domicilio procesal es requerido'),
  }),
  demandado: z.object({
    ci: z.string().min(1, 'El CI es requerido').regex(/^\d{5,9}-(LP|CB|SC|OR|PT|CH|TJ|BE|PD)$/, 'Formato: 12345678-LP'),
    nombres: z.string().min(2, 'Los nombres son requeridos'),
    apellidos: z.string().min(2, 'Los apellidos son requeridos'),
    domicilioReal: z.string().min(10, 'El domicilio es requerido'),
  }),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  datos: Partial<DemandaFormData>;
  onSiguiente: (datos: Partial<DemandaFormData>) => void;
  onAnterior: () => void;
}

export function Paso1Partes({ datos, onSiguiente }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      demandante: datos.demandante || {
        ci: '',
        nombres: '',
        apellidos: '',
        edad: 18,
        estadoCivil: '',
        profesion: '',
        domicilioReal: '',
        domicilioProcesal: '',
      },
      demandado: datos.demandado || {
        ci: '',
        nombres: '',
        apellidos: '',
        domicilioReal: '',
      },
    },
  });

  const onSubmit = (data: FormData) => {
    onSiguiente(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* DEMANDANTE */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Datos del Demandante (Actor)</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="demandante.ci"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula de Identidad*</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678-LP" {...field} />
                  </FormControl>
                  <FormDescription>Formato: número-departamento</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="demandante.edad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Edad*</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="demandante.nombres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombres*</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Carlos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="demandante.apellidos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellidos*</FormLabel>
                  <FormControl>
                    <Input placeholder="Pérez López" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="demandante.estadoCivil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado Civil*</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SOLTERO">Soltero/a</SelectItem>
                      <SelectItem value="CASADO">Casado/a</SelectItem>
                      <SelectItem value="DIVORCIADO">Divorciado/a</SelectItem>
                      <SelectItem value="VIUDO">Viudo/a</SelectItem>
                      <SelectItem value="CONCUBINO">Concubino/a</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="demandante.profesion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profesión u Oficio*</FormLabel>
                  <FormControl>
                    <Input placeholder="Comerciante, Abogado, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="demandante.domicilioReal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domicilio Real*</FormLabel>
                <FormControl>
                  <Textarea placeholder="Calle, número, zona, ciudad..." {...field} />
                </FormControl>
                <FormDescription>Domicilio donde reside habitualmente</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="demandante.domicilioProcesal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domicilio Procesal*</FormLabel>
                <FormControl>
                  <Textarea placeholder="Calle, número, zona, ciudad..." {...field} />
                </FormControl>
                <FormDescription>Dentro del radio del asiento del juzgado (Art. 110)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* DEMANDADO */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Datos del Demandado</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="demandado.ci"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula de Identidad*</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678-LP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="demandado.nombres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombres*</FormLabel>
                  <FormControl>
                    <Input placeholder="María Elena" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="demandado.apellidos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellidos*</FormLabel>
                  <FormControl>
                    <Input placeholder="González Quispe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="demandado.domicilioReal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domicilio (para citación)*</FormLabel>
                <FormControl>
                  <Textarea placeholder="Calle, número, zona, ciudad..." {...field} />
                </FormControl>
                <FormDescription>Domicilio donde se realizará la citación</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            Siguiente <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
