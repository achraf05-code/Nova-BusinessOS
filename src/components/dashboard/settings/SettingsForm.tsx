"use client";
import React, { useState, useTransition } from "react";
import Field from "@/components/form/Field";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/TextArea";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { updateCompanySettingsAction } from "@/app/dashboard/settings/actions";
import type { Company } from "@/types/database";

interface Props {
  company: Company;
  contact?: { email?: string | null; phone?: string | null; address?: string | null };
}

export default function SettingsForm({ company, contact }: Props) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setErrors({});
    startTransition(async () => {
      const res = await updateCompanySettingsAction(data);
      if (!res.ok) {
        setErrors(res.fields ?? {});
        toast.error(res.error);
        return;
      }
      toast.success("Settings saved");
    });
  };

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Company name" required error={errors.name}>
          <Input name="name" defaultValue={company.name} />
        </Field>
        <Field label="Industry" error={errors.industry}>
          <Input name="industry" defaultValue={company.industry ?? ""} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Currency" required error={errors.currency}>
          <Input name="currency" defaultValue={company.currency} />
        </Field>
        <Field label="Timezone" required error={errors.timezone}>
          <Input name="timezone" defaultValue={company.timezone} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Company email" error={errors.email}>
          <Input
            type="email"
            name="email"
            defaultValue={contact?.email ?? ""}
          />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <Input name="phone" defaultValue={contact?.phone ?? ""} />
        </Field>
      </div>
      <Field label="Address" error={errors.address}>
        <TextArea name="address" rows={3} defaultValue={contact?.address ?? ""} />
      </Field>
      {errors._form && (
        <p className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-300">
          {errors._form}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
