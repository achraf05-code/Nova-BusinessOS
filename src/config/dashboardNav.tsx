import React from "react";
import {
  GridIcon,
  GroupIcon,
  TaskIcon,
  DollarLineIcon,
  BoxIconLine,
  PieChartIcon,
  ShootingStarIcon,
  DocsIcon,
  UserCircleIcon,
  CalenderIcon,
  PlugInIcon,
  ListIcon,
  BellIcon,
  EnvelopeIcon,
  BoltIcon,
} from "@/icons";

export type DashboardNavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

export const mainNav: DashboardNavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
  { icon: <GroupIcon />, name: "CRM", path: "/dashboard/crm" },
  { icon: <UserCircleIcon />, name: "Customers", path: "/dashboard/customers" },
  { icon: <TaskIcon />, name: "Projects", path: "/dashboard/projects" },
  { icon: <DocsIcon />, name: "Invoices", path: "/dashboard/invoices" },
  { icon: <BoxIconLine />, name: "Expenses", path: "/dashboard/expenses" },
  { icon: <DollarLineIcon />, name: "Accounting", path: "/dashboard/accounting" },
  { icon: <ShootingStarIcon />, name: "AI CFO", path: "/dashboard/ai-cfo" },
  { icon: <PieChartIcon />, name: "Reports", path: "/dashboard/reports" },
];

export const workspaceNav: DashboardNavItem[] = [
  { icon: <BellIcon />, name: "Notifications", path: "/dashboard/notifications" },
  { icon: <CalenderIcon />, name: "Calendar", path: "/dashboard/calendar" },
  { icon: <ListIcon />, name: "Activity Log", path: "/dashboard/activity" },
  {
    icon: <PlugInIcon />,
    name: "Settings",
    subItems: [
      { name: "Workspace", path: "/dashboard/settings" },
      { name: "Team", path: "/dashboard/settings/team" },
    ],
  },
  { icon: <EnvelopeIcon />, name: "Billing", path: "/dashboard/billing" },
  { icon: <BoltIcon />, name: "System status", path: "/dashboard/system" },
];
