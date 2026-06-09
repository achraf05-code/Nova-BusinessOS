"use client";
import React, {
  useMemo,
  useState,
  useTransition,
  useOptimistic,
} from "react";
import type { CrmDeal, LeadStage } from "@/types/database";
import { formatCurrency } from "@/lib/format";
import Badge from "@/components/ui/badge/Badge";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { moveDealStageAction } from "@/app/dashboard/crm/actions";
import { TrashBinIcon, PencilIcon } from "@/icons";

const STAGES: { id: LeadStage; label: string; tone: string }[] = [
  { id: "lead", label: "Lead", tone: "bg-gray-400" },
  { id: "contacted", label: "Contacted", tone: "bg-blue-light-500" },
  { id: "meeting", label: "Meeting", tone: "bg-warning-500" },
  { id: "proposal", label: "Proposal", tone: "bg-theme-purple-500" },
  { id: "won", label: "Won", tone: "bg-success-500" },
  { id: "lost", label: "Lost", tone: "bg-error-500" },
];

interface Props {
  deals: CrmDeal[];
  onEdit?: (deal: CrmDeal) => void;
  onDelete?: (deal: CrmDeal) => void;
  onAddInStage?: (stage: LeadStage) => void;
}

type Action = { id: string; stage: LeadStage };

export default function PipelineBoardDnd({
  deals,
  onEdit,
  onDelete,
  onAddInStage,
}: Props) {
  const [query, setQuery] = useState("");
  const [optimistic, applyOptimistic] = useOptimistic<CrmDeal[], Action>(
    deals,
    (state, action) =>
      state.map((d) =>
        d.id === action.id ? { ...d, stage: action.stage } : d
      )
  );
  const [hoverStage, setHoverStage] = useState<LeadStage | null>(null);
  const [, startTransition] = useTransition();
  const toast = useToast();

  const filtered = useMemo(() => {
    if (!query) return optimistic;
    const q = query.toLowerCase();
    return optimistic.filter((d) => d.title.toLowerCase().includes(q));
  }, [query, optimistic]);

  const moveTo = (id: string, stage: LeadStage) => {
    const before = optimistic.find((d) => d.id === id);
    if (!before || before.stage === stage) return;
    startTransition(async () => {
      applyOptimistic({ id, stage });
      const res = await moveDealStageAction(id, stage);
      if (!res.ok) {
        // Roll back by re-applying previous stage.
        applyOptimistic({ id, stage: before.stage });
        toast.error("Could not move deal", res.error);
      } else if (stage === "won") {
        toast.success(`Deal moved to Won`);
      }
    });
  };

  const onDragStart = (e: React.DragEvent<HTMLElement>, dealId: string) => {
    e.dataTransfer.setData("text/deal", dealId);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search deals…"
          className="h-10 w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tip: drag cards across stages to update them.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-6">
        {STAGES.map((stage) => {
          const items = filtered.filter((d) => d.stage === stage.id);
          const total = items.reduce((s, d) => s + d.value, 0);
          const isHover = hoverStage === stage.id;
          return (
            <div
              key={stage.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (hoverStage !== stage.id) setHoverStage(stage.id);
              }}
              onDragLeave={() => {
                if (hoverStage === stage.id) setHoverStage(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/deal");
                setHoverStage(null);
                if (id) moveTo(id, stage.id);
              }}
              className={`flex flex-col rounded-2xl border bg-gray-50 p-3 transition-colors dark:bg-white/[0.02] ${
                isHover
                  ? "border-brand-400 ring-2 ring-brand-500/20"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <header className="mb-3 flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${stage.tone}`} />
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    {stage.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onAddInStage?.(stage.id)}
                  className="rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-700 dark:hover:bg-gray-900 dark:hover:text-gray-200"
                  title={`Add ${stage.label} deal`}
                  aria-label={`Add deal in ${stage.label}`}
                >
                  +
                </button>
              </header>
              <div className="flex flex-col gap-2">
                {items.map((deal) => (
                  <article
                    key={deal.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, deal.id)}
                    className="group cursor-grab rounded-xl border border-gray-200 bg-white p-3 shadow-theme-xs transition active:cursor-grabbing dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {deal.title}
                      </p>
                      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => onEdit?.(deal)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                          aria-label="Edit deal"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete?.(deal)}
                          className="rounded p-1 text-gray-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10"
                          aria-label="Delete deal"
                        >
                          <TrashBinIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatCurrency(deal.value, deal.currency)}</span>
                      <Badge
                        size="sm"
                        color={
                          deal.probability >= 75
                            ? "success"
                            : deal.probability >= 40
                            ? "warning"
                            : "light"
                        }
                      >
                        {deal.probability}%
                      </Badge>
                    </div>
                  </article>
                ))}
                {items.length === 0 && (
                  <p className="px-1 py-3 text-xs text-gray-400 dark:text-gray-500">
                    Drop a deal here, or add one.
                  </p>
                )}
              </div>
              <footer className="mt-3 border-t border-gray-200 px-1 pt-3 dark:border-gray-800">
                <span className="text-[10px] uppercase tracking-wider text-gray-500">
                  Stage value
                </span>
                <div className="text-sm font-semibold text-gray-800 dark:text-white">
                  {formatCurrency(total)}
                </div>
              </footer>
            </div>
          );
        })}
      </div>
    </div>
  );
}
