"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getStore, isoNow, newId } from "@/lib/demoStore";
import { withAction, actionOk, actionFail } from "@/lib/actions";
import {
  flatFieldErrors,
  projectSchema,
  taskSchema,
} from "@/lib/validation";
import { logActivity, notify } from "@/lib/activity";
import { checkUsage } from "@/lib/usage";
import type { Project, Task, TaskStatus } from "@/types/database";

const PATHS = ["/dashboard/projects", "/dashboard"];

/* -------------------- Projects -------------------------------------- */

export async function createProjectAction(form: Record<string, unknown>) {
  return withAction({ revalidate: PATHS }, async (ctx) => {
    const usage = await checkUsage(ctx.company.id, "project");
    if (!usage.ok) return actionFail(usage.error);
    const parsed = projectSchema.safeParse(form);
    if (!parsed.success) {
      return actionFail("Invalid project data", flatFieldErrors(parsed.error));
    }
    const v = parsed.data;
    const row = {
      company_id: ctx.company.id,
      name: v.name,
      description: v.description || null,
      status: v.status,
      client_id: v.client_id || null,
      budget: v.budget ?? null,
      start_date: v.start_date || null,
      due_date: v.due_date || null,
      created_by: ctx.user.id,
    };

    let project: Project;
    if (supabaseConfigured) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("projects")
        .insert(row as never)
        .select("*")
        .single();
      if (error || !data) return actionFail(error?.message ?? "Insert failed");
      project = data as Project;
    } else {
      project = {
        id: newId(),
        ...row,
        created_at: isoNow(),
        updated_at: isoNow(),
      } as Project;
      getStore().projects.unshift(project);
    }

    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "project.created",
      entityType: "project",
      entityId: project.id,
      metadata: { name: project.name },
    });
    return actionOk(project);
  });
}

export async function updateProjectAction(
  id: string,
  form: Record<string, unknown>
) {
  return withAction({ revalidate: PATHS }, async (ctx) => {
    const parsed = projectSchema.partial().safeParse(form);
    if (!parsed.success) {
      return actionFail("Invalid project data", flatFieldErrors(parsed.error));
    }
    const v = parsed.data;
    const patch: Record<string, unknown> = {};
    if (v.name !== undefined) patch.name = v.name;
    if (v.description !== undefined) patch.description = v.description || null;
    if (v.status !== undefined) patch.status = v.status;
    if (v.client_id !== undefined) patch.client_id = v.client_id || null;
    if (v.budget !== undefined) patch.budget = v.budget ?? null;
    if (v.start_date !== undefined) patch.start_date = v.start_date || null;
    if (v.due_date !== undefined) patch.due_date = v.due_date || null;

    if (supabaseConfigured) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("projects")
        .update(patch as never)
        .eq("id", id)
        .eq("company_id", ctx.company.id);
      if (error) return actionFail(error.message);
    } else {
      const store = getStore();
      const existing = store.projects.find(
        (p) => p.id === id && p.company_id === ctx.company.id
      );
      if (!existing) return actionFail("Project not found");
      Object.assign(existing, patch, { updated_at: isoNow() });
    }

    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "project.updated",
      entityType: "project",
      entityId: id,
    });
    return actionOk({ id });
  });
}

export async function deleteProjectAction(id: string) {
  return withAction({ revalidate: PATHS, requiredRole: "manager" }, async (ctx) => {
    if (supabaseConfigured) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)
        .eq("company_id", ctx.company.id);
      if (error) return actionFail(error.message);
    } else {
      const store = getStore();
      const before = store.projects.length;
      store.projects = store.projects.filter(
        (p) => !(p.id === id && p.company_id === ctx.company.id)
      );
      if (store.projects.length === before) return actionFail("Project not found");
    }
    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "project.deleted",
      entityType: "project",
      entityId: id,
    });
    return actionOk({ id });
  });
}

/* -------------------- Tasks ----------------------------------------- */

export async function createTaskAction(form: Record<string, unknown>) {
  return withAction({ revalidate: PATHS }, async (ctx) => {
    const parsed = taskSchema.safeParse(form);
    if (!parsed.success) {
      return actionFail("Invalid task data", flatFieldErrors(parsed.error));
    }
    const v = parsed.data;
    const row = {
      company_id: ctx.company.id,
      project_id: v.project_id || null,
      title: v.title,
      description: v.description || null,
      status: v.status,
      priority: v.priority,
      assigned_to: v.assigned_to || null,
      due_date: v.due_date || null,
      position: 0,
      created_by: ctx.user.id,
    };

    let task: Task;
    if (supabaseConfigured) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("tasks")
        .insert(row as never)
        .select("*")
        .single();
      if (error || !data) return actionFail(error?.message ?? "Insert failed");
      task = data as Task;
    } else {
      task = {
        id: newId(),
        ...row,
        created_at: isoNow(),
        updated_at: isoNow(),
      } as Task;
      getStore().tasks.unshift(task);
    }

    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "task.created",
      entityType: "task",
      entityId: task.id,
      metadata: { title: task.title },
    });

    if (task.assigned_to && task.assigned_to !== ctx.user.id) {
      await notify({
        companyId: ctx.company.id,
        userId: task.assigned_to,
        type: "task_assigned",
        title: `Task assigned — ${task.title}`,
        body: task.due_date ? `Due ${task.due_date}` : null,
        href: "/dashboard/projects",
      });
    }
    return actionOk(task);
  });
}

export async function updateTaskAction(
  id: string,
  form: Record<string, unknown>
) {
  return withAction({ revalidate: PATHS }, async (ctx) => {
    const parsed = taskSchema.partial().safeParse(form);
    if (!parsed.success) {
      return actionFail("Invalid task data", flatFieldErrors(parsed.error));
    }
    const v = parsed.data;
    const patch: Record<string, unknown> = {};
    if (v.title !== undefined) patch.title = v.title;
    if (v.description !== undefined) patch.description = v.description || null;
    if (v.status !== undefined) patch.status = v.status;
    if (v.priority !== undefined) patch.priority = v.priority;
    if (v.assigned_to !== undefined)
      patch.assigned_to = v.assigned_to || null;
    if (v.due_date !== undefined) patch.due_date = v.due_date || null;
    if (v.project_id !== undefined) patch.project_id = v.project_id || null;

    if (supabaseConfigured) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("tasks")
        .update(patch as never)
        .eq("id", id)
        .eq("company_id", ctx.company.id);
      if (error) return actionFail(error.message);
    } else {
      const store = getStore();
      const existing = store.tasks.find(
        (t) => t.id === id && t.company_id === ctx.company.id
      );
      if (!existing) return actionFail("Task not found");
      Object.assign(existing, patch, { updated_at: isoNow() });
    }

    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "task.updated",
      entityType: "task",
      entityId: id,
      metadata: { status: v.status, priority: v.priority },
    });
    return actionOk({ id });
  });
}

export async function moveTaskStatusAction(id: string, status: TaskStatus) {
  return updateTaskAction(id, { status });
}

export async function deleteTaskAction(id: string) {
  return withAction({ revalidate: PATHS, requiredRole: "manager" }, async (ctx) => {
    if (supabaseConfigured) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("company_id", ctx.company.id);
      if (error) return actionFail(error.message);
    } else {
      const store = getStore();
      const before = store.tasks.length;
      store.tasks = store.tasks.filter(
        (t) => !(t.id === id && t.company_id === ctx.company.id)
      );
      if (store.tasks.length === before) return actionFail("Task not found");
    }
    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "task.deleted",
      entityType: "task",
      entityId: id,
    });
    return actionOk({ id });
  });
}
