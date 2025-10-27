import type { HTMLAttributes } from "react";
import type { z } from "zod";
import { string, object } from "zod";

export type UserAuthFormProps = HTMLAttributes<HTMLDivElement>;

export const signInFormSchema = object({
  email: string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Invalid email address" }),
  password: string()
    .min(1, { message: "Please enter your password" })
    .min(7, { message: "Password must be at least 7 characters long" }),
});

export type SignInFormData = z.infer<typeof signInFormSchema>; 