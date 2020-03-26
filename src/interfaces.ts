import { Uuid } from "@typed/uuid";
export interface ItemType {
  id: Uuid;
  type: "NOTE" | "TODO";
  text: string;
  deleted: boolean;
  completed: boolean;
  parentId: Uuid;
  children: Uuid[];
  projectId: Uuid;
  dueDate: string;
  scheduledDate: string;
  lastUpdatedAt: string;
  completedAt: string;
  deletedAt: string;
  repeat: string;
  hidden: boolean;
  hiddenChildren: boolean;
}

export interface ProjectType {
  id: Uuid;
  name: string;
  deleted: boolean;
  description: string;
  lastUpdatedAt: string;
  deletedAt: string;
  createdAt: string;
}
