"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Field from "@/components/form/Field";
import Input from "@/components/form/input/InputField";
import NativeSelect from "@/components/form/NativeSelect";
import ConfirmDialog from "@/components/ui/dialog/ConfirmDialog";
import { useToast } from "@/components/ui/toast/ToastProvider";
import {
  cancelInvitationAction,
  inviteTeamMemberAction,
  resendInvitationAction,
} from "@/app/dashboard/settings/team/actions";
import type { Employee, TeamInvitation } from "@/types/database";
import { formatDateTime } from "@/lib/format";
import { TrashBinIcon } from "@/icons";

interface Props {
  invitations: TeamInvitation[];
  members: Employee[];
}

const ROLE_OPTS = [
  { label: "Employee", value: "employee" },
  { label: "Manager", value: "manager" },
  { label: "Admin", value: "admin" },
];

export default function TeamWorkspace({ invitations, members }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState<TeamInvitation | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => router.refresh();

  const onInvite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd);
    setErrors({});
    setPending(true);
    startTransition(async () => {
      const res = await inviteTeamMemberAction(data);
      setPending(false);
      if (!res.ok) {
        setErrors(res.fields ?? {});
        toast.error(res.error);
        return;
      }
      toast.success("Invitation sent");
      (e.target as HTMLFormElement).reset();
      refresh();
    });
  };

  const onResend = (id: string) => {
    startTransition(async () => {
      const res = await resendInvitationAction(id);
      if (!res.ok) toast.error("Couldn't resend", res.error);
      else toast.success("Invitation resent");
    });
  };

  const onCancelConfirm = () => {
    if (!confirm) return;
    const id = confirm.id;
    setBusy(true);
    startTransition(async () => {
      const res = await cancelInvitationAction(id);
      setBusy(false);
      setConfirm(null);
      if (!res.ok) toast.error("Couldn't cancel", res.error);
      else {
        toast.success("Invitation canceled");
        refresh();
      }
    });
  };

  const pending_invites = invitations.filter((i) => !i.accepted_at);
  const accepted = invitations.filter((i) => i.accepted_at);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Invite a teammate
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Send a secure invitation link by email. The invite expires in 14 days.
        </p>
        <form
          onSubmit={onInvite}
          className="mt-5 grid gap-4 sm:grid-cols-[1fr,200px,auto] sm:items-end"
        >
          <Field label="Email" required error={errors.email}>
            <Input type="email" name="email" placeholder="teammate@company.com" />
          </Field>
          <Field label="Role" required error={errors.role}>
            <NativeSelect
              name="role"
              defaultValue="employee"
              options={ROLE_OPTS}
            />
          </Field>
          <button
            type="submit"
            disabled={pending}
            className="h-11 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send invite"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Pending invitations
        </h3>
        <div className="mt-4 max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Sent</Th>
                <Th>Expires</Th>
                <Th className="text-right">Actions</Th>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {pending_invites.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No pending invitations.
                  </TableCell>
                </TableRow>
              )}
              {pending_invites.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {inv.email}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge size="sm" color="info">
                      {inv.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDateTime(inv.created_at)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDateTime(inv.expires_at)}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onResend(inv.id)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Resend
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirm(inv)}
                        className="rounded-lg border border-error-200 bg-white p-1.5 text-error-500 hover:bg-error-50 dark:border-error-500/40 dark:bg-gray-800 dark:hover:bg-error-500/10"
                        aria-label="Cancel invitation"
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Members
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {members.length} active · {accepted.length} accepted invitations
        </p>
        <div className="mt-4 max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {members.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Invite your first teammate to get started.
                  </TableCell>
                </TableRow>
              )}
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {m.full_name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {m.email ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {m.role_title ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge
                      size="sm"
                      color={m.status === "active" ? "success" : "warning"}
                    >
                      {m.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirm)}
        title={`Cancel invitation to ${confirm?.email ?? ""}?`}
        description="The invitation link will stop working immediately."
        confirmLabel="Cancel invitation"
        loading={busy}
        onConfirm={onCancelConfirm}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TableCell
      isHeader
      className={`px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 ${className}`}
    >
      {children}
    </TableCell>
  );
}
