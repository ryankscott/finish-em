import { Uuid } from "@typed/uuid";
import { RRule } from "rrule";
export interface ItemType {
  id: Uuid;
  type: "NOTE" | "TODO";
  text: string;
  deleted: boolean;
  completed: boolean;
  parentId: Uuid;
  children: Uuid[];
  projectId: Uuid;
  dueDate: Date;
  scheduledDate: Date;
  lastUpdatedAt: Date;
  completedAt: Date;
  deletedAt: Date;
  repeat: RRule | string;
  hidden: boolean;
  hiddenChildren: boolean;
}

export interface ProjectType {
  id: Uuid;
  name: string;
  deleted: boolean;
  description: string;
  lastUpdatedAt: Date;
  deletedAt: Date;
  createdAt: Date;
}
