import log from 'electron-log';
import { defaultValueProcessor, formatQuery } from 'react-querybuilder';
import { rrulestr } from 'rrule';
import { without } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { SQLDataSource } from 'datasource-sql';
import {
  Area,
  AreaOrder,
  Calendar,
  Component,
  ComponentOrder,
  Feature,
  Item,
  ItemOrder,
  Label,
  Project,
  ProjectOrder,
  Reminder,
  View,
  ViewOrder,
  WeeklyGoal,
} from '../resolvers-types';

class AppDatabase extends SQLDataSource {
  /* View Order */

  async getViewOrders(): Promise<ViewOrder[]> {
    return this.knex('viewOrder').select('*');
  }

  async getViewOrder(key: string): Promise<ViewOrder> {
    try {
      const viewOrder = await this.knex()
        .select<ViewOrder>('*')
        .from('viewOrder')
        .where({ key })
        .first();

      if (!viewOrder) {
        throw new Error(`No viewOrder found with key: ${key}`);
      }
      return viewOrder;
    } catch (err) {
      log.error(`Failed to get viewOrder with key: ${key} - ${err}`);
      throw err;
    }
  }

  async createViewOrder(viewKey: string): Promise<ViewOrder> {
    const maxSortOrder = await this.knex
      .max('sortOrder as max')
      .from('viewOrder')
      .first();

    try {
      await this.knex
        .insert({
          viewKey,
          sortOrder: maxSortOrder ? maxSortOrder?.max + 1 : 0,
        })
        .into('viewOrder');

      const insertedRow = await this.knex<ViewOrder>('viewOrder')
        .select('*')
        .where({ viewKey })
        .first();

      if (!insertedRow) {
        log.error(`Failed to get viewOrder after inserting: ${viewKey}`);
        throw new Error('Failed to get inserted row');
      }

      return insertedRow;
    } catch (err) {
      log.error(`Failed to create viewOrder with viewKey: ${viewKey} - ${err}`);
      throw err;
    }
  }

  async setViewOrder(key: string, sortOrder: number): Promise<ViewOrder> {
    const currentViewOrder = await this.getViewOrder(key);
    if (!currentViewOrder) {
      throw new Error('Failed to get current view order');
    }

    const currentOrder = currentViewOrder.sortOrder;
    if (sortOrder < currentOrder) {
      await this.knex('viewOrder')
        .update({ sortOrder: sortOrder + 1 })
        .whereBetween('sortOrder', [sortOrder, currentOrder - 1]);
    } else {
      await this.knex('viewOrder')
        .update({ sortOrder: sortOrder - 1 })
        .whereBetween('sortOrder', [currentOrder + 1, sortOrder]);
    }
    await this.knex('viewOrder').where({ viewKey: key }).update({ sortOrder });

    const newViewOrder = await this.getViewOrder(key);
    if (!newViewOrder) {
      throw new Error('Failed to get new view order');
    }

    return newViewOrder;
  }

  /* Views */

  async getViews(): Promise<View[]> {
    return this.knex('view').select('*');
  }

  async getView(key: string): Promise<View> {
    try {
      const view = await this.knex()
        .select<View>('*')
        .from('view')
        .where({ key })
        .first();

      if (!view) {
        log.error(`Failed to get view with key: ${key}`);
        throw new Error(`No view found with key: ${key}`);
      }

      return view;
    } catch (err) {
      log.error(`Failed to get view with key: ${key} - ${err}`);
      throw err;
    }
  }

  // TODO: Turn this into a transaction
  async createView(
    key: string,
    name: string,
    icon: string,
    type: string
  ): Promise<View> {
    try {
      const insertedId = await this.knex
        .insert({
          key,
          name,
          icon,
          type,
          deleted: false,
          lastUpdatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        })
        .into('view')
        .first();

      await this.createViewOrder(key);

      const view = await this.knex
        .select<View>('*')
        .from('view')
        .where({ id: insertedId })
        .first();

      if (!view) {
        log.error(`Failed to get view with id: ${insertedId}`);
        throw new Error('Failed to get inserted view');
      }

      return view;
    } catch (err) {
      log.error(`Failed to create view with key: ${key} - ${err}`);
      throw err;
    }
  }

  async deleteView(key: string): Promise<View> {
    try {
      await this.knex('view').where({ key }).update({
        deleted: true,
        lastUpdatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
      });

      const deletedView = await this.knex<View>('view')
        .select('*')
        .where({ key })
        .first();

      if (!deletedView) {
        log.error(`Failed to get deleted view with key: ${key}`);
        throw new Error('Failed to get deleted view');
      }

      return deletedView;
    } catch (err) {
      log.error(`Failed to delete view with key: ${key} - ${err}`);
      throw err;
    }
  }

  async renameView(key: string, name: string): Promise<View> {
    try {
      await this.knex('view')
        .where({ key })
        .update({ name, lastUpdatedAt: new Date().toISOString() });

      const updatedView = await this.knex<View>('view')
        .select('*')
        .where({ key })
        .first();
      if (!updatedView) {
        log.error('Failed to get updated view when renaming');
        throw new Error('Failed to get updated view');
      }

      return updatedView;
    } catch (err) {
      log.error(`Failed to rename view with key: ${key} - ${err}`);
      throw err;
    }
  }

  /* ProjectOrder */
  async getProjectOrders(): Promise<ProjectOrder[]> {
    return this.knex('projectOrder').select('*');
  }

  async getProjectOrder(key: string): Promise<ProjectOrder> {
    try {
      const projectOrder = await this.knex()
        .select<ProjectOrder>('*')
        .from('projectOrder')
        .where({ key })
        .first();

      if (!projectOrder) {
        log.error(`Failed to get project order with key: ${key}`);
        throw new Error(`No projectOrder found with key: ${key}`);
      }
      return projectOrder;
    } catch (err) {
      log.error(`Failed to get projectOrder with key: ${key} - ${err}`);
      throw err;
    }
  }

  async createProjectOrder(projectKey: string): Promise<ProjectOrder> {
    const maxSortOrder = await this.knex
      .max('sortOrder as max')
      .from('projectOrder')
      .first();

    try {
      await this.knex
        .insert({
          projectKey,
          sortOrder: maxSortOrder ? maxSortOrder?.max + 1 : 0,
        })
        .into('projectOrder');

      const insertedRow = await this.knex<ProjectOrder>('projectOrder')
        .select('*')
        .where({ projectKey })
        .first();

      if (!insertedRow) {
        log.error(`Failed to get projectOrder after inserting: ${projectKey}`);
        throw new Error('Failed to get inserted row');
      }

      return insertedRow;
    } catch (err) {
      log.error(
        `Failed to create projectOrder with projectKey: ${projectKey} - ${err}`
      );
      throw err;
    }
  }

  async setProjectOrder(key: string, sortOrder: number): Promise<ProjectOrder> {
    const currentProjectOrder = await this.getProjectOrder(key);
    const currentOrder = currentProjectOrder.sortOrder;
    try {
      if (sortOrder < currentOrder) {
        await this.knex('projectOrder')
          .update({ sortOrder: sortOrder + 1 })
          .whereBetween('sortOrder', [sortOrder, currentOrder - 1]);
      } else {
        await this.knex('projectOrder')
          .update({ sortOrder: sortOrder - 1 })
          .whereBetween('sortOrder', [currentOrder + 1, sortOrder]);
      }
      await this.knex('projectOrder')
        .where({ projectKey: key })
        .update({ sortOrder });
    } catch (err) {
      log.error(`Failed to set projectOrder with key: ${key} - ${err}`);
      throw err;
    }
    const projectOrder = await this.getProjectOrder(key);
    return projectOrder;
  }

  /* Projects */
  async getProjects(): Promise<Project[]> {
    return this.knex.select('*').from('project');
  }

  async getProject(key: string): Promise<Project> {
    try {
      const project = await this.knex()
        .select<Project>('*')
        .from('project')
        .where({ key })
        .first();

      if (!project) {
        log.error(`Failed to get project with key: ${key}`);
        throw new Error(`No project found with key: ${key}`);
      }

      return project;
    } catch (err) {
      log.error(`Failed to get project with key: ${key} - ${err}`);
      throw err;
    }
  }

  async getProjectsByArea(areaKey: string): Promise<Project[]> {
    try {
      const projects = await this.knex()
        .select('*')
        .from('project')
        .where({ areaKey });
      return projects;
    } catch (err) {
      log.error(`Failed to get project with key: ${areaKey} - ${err}`);
      throw err;
    }
  }

  async createProject(
    key: string,
    name: string,
    description: string
  ): Promise<Project> {
    try {
      const insertedId = await this.knex
        .insert({
          key,
          name,
          deleted: false,
          description,
          lastUpdatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        })
        .into('project')
        .first();
      if (!insertedId) {
        log.error(`Failed to create project with key: ${key}`);
        throw new Error(`Failed to create project with key: ${key}`);
      }

      this.createProjectOrder(key);
      this.createView(key, name, '', 'project');

      const insertedProject = await this.knex
        .select('*')
        .from<Project>('project')
        .where({ key })
        .first();

      if (!insertedProject) {
        log.error(`Failed to get project after inserting: ${key}`);
        throw new Error(`Failed to get project after inserting: ${key}`);
      }
      return insertedProject;
    } catch (err) {
      log.error(`Failed to create project with key: ${key} - ${err}`);
      throw err;
    }
  }

  async deleteProject(key: string): Promise<Project> {
    try {
      const deletedId = await this.knex('project').where({ key }).update({
        deleted: true,
        lastUpdatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
      });
      if (deletedId) {
        const items = await this.getItemsByProject(key);
        if (items) {
          items.map((i: Item) => this.setProjectOfItem(i.key, '0'));
        }
        await this.deleteView(key);
        const deletedProject = await this.getProject(key);
        return deletedProject;
      }
      log.error(`Failed to delete project with key: ${key}`);
      throw new Error(`Failed to delete project with key: ${key}`);
    } catch (err) {
      log.error(`Failed to delete project with key: ${key} - ${err}`);
      throw err;
    }
  }

  async renameProject(key: string, name: string): Promise<Project> {
    try {
      const projectId = await this.knex('project')
        .update({ name, lastUpdatedAt: new Date().toISOString() })
        .where({ key });
      if (projectId) {
        this.renameView(key, name);
        this.updateComponentOnProjectNameChange(key, name);
        const project = await this.getProject(key);
        return project;
      }
      log.error(`Failed to rename project with key: ${key}`);
      throw new Error(`Failed to rename project with key: ${key}`);
    } catch (err) {
      log.error(`Failed to rename project with key: ${key} - ${err}`);
      throw err;
    }
  }

  async changeDescriptionOfProject(
    key: string,
    description: string
  ): Promise<Project> {
    try {
      const projectId = await this.knex('project')
        .where({ key })
        .update({ description, lastUpdatedAt: new Date().toISOString() });
      if (projectId) {
        const project = await this.getProject(key);
        return project;
      }
      log.error(`Failed to change description of project with key: ${key}`);
      throw new Error(
        `Failed to change description of project with key: ${key}`
      );
    } catch (err) {
      log.error(
        `Failed to change description of project with key: ${key} - ${err}`
      );
      throw err;
    }
  }

  async setEndDateOfProject(key: string, endAt: Date) {
    try {
      const projectId = await this.knex('project')
        .where({ key })
        .update({ endAt, lastUpdatedAt: new Date().toISOString() });

      if (projectId) {
        const project = await this.getProject(key);
        return project;
      }
      log.error(`Failed to set end date of project with key: ${key}`);
      throw new Error(`Failed to set end date of project with key: ${key}`);
    } catch (err) {
      log.error(`Failed to set end date of project with key: ${key} - ${err}`);
      throw err;
    }
  }

  async setStartDateOfProject(key: string, startAt: Date) {
    try {
      const projectId = await this.knex('project')
        .where({ key })
        .update({ startAt, lastUpdatedAt: new Date().toISOString() });

      if (projectId) {
        const project = await this.getProject(key);
        return project;
      }
      log.error(`Failed to set start date of project with key: ${key}`);
      throw new Error(`Failed to set start date of project with key: ${key}`);
    } catch (err) {
      log.error(
        `Failed to set start date of project with key: ${key} - ${err}`
      );
      throw err;
    }
  }

  async setEmojiOfProject(key: string, emoji: string): Promise<Project> {
    try {
      const projectId = await this.knex('project')
        .where({ key })
        .update({ emoji, lastUpdatedAt: new Date().toISOString() });

      if (projectId) {
        const project = await this.getProject(key);
        return project;
      }
      log.error(`Failed to set emoji of project with key: ${key}`);
      throw new Error(`Failed to set emoji of project with key: ${key}`);
    } catch (err) {
      log.error(`Failed to set emoji of project with key: ${key} - ${err}`);
      throw err;
    }
  }

  async setAreaOfProject(key: string, areaKey: string): Promise<Project> {
    try {
      const projectId = await this.knex('project')
        .where({ key })
        .update({ areaKey, lastUpdatedAt: new Date().toISOString() });

      if (projectId) {
        const project = await this.getProject(key);
        return project;
      }
      log.error(`Failed to set area of project with key: ${key}`);
      throw new Error(`Failed to set area of project with key: ${key}`);
    } catch (err) {
      log.error(`Failed to set area of project with key: ${key} - ${err}`);
      throw err;
    }
  }

  /* AreaOrder */

  async getAreaOrders(): Promise<AreaOrder[]> {
    return this.knex('areaOrder').select('*');
  }

  async getAreaOrder(key: string): Promise<AreaOrder> {
    try {
      const areaOrder = await this.knex()
        .select('*')
        .from('areaOrder')
        .where({ key })
        .first();
      return areaOrder;
    } catch (err) {
      log.error(`Failed to get areaOrder with key: ${key} - ${err}`);
      throw err;
    }
  }

  async createAreaOrder(areaKey: string): Promise<AreaOrder> {
    try {
      const maxSortOrder = await this.knex
        .max('sortOrder as max')
        .from('areaOrder')
        .first();

      const insertedId = await this.knex
        .insert({
          areaKey,
          sortOrder: maxSortOrder ? maxSortOrder?.max + 1 : 0,
        })
        .into('areaOrder');
      if (!insertedId) {
        log.error(`Failed to create areaOrder with areaKey: ${areaKey}`);
        throw new Error(`Failed to create areaOrder with areaKey: ${areaKey}`);
      }

      const areaOrder = await this.getAreaOrder(areaKey);
      return areaOrder;
    } catch (err) {
      log.error(`Failed to create areaOrder with key: ${areaKey} - ${err}`);
      throw err;
    }
  }

  async setAreaOrder(key: string, sortOrder: number): Promise<AreaOrder> {
    try {
      const currentAreaOrder = await this.getAreaOrder(key);
      const currentOrder = currentAreaOrder.sortOrder;
      if (sortOrder < currentOrder) {
        await this.knex('areaOrder')
          .update({ sortOrder: sortOrder + 1 })
          .whereBetween('sortOrder', [sortOrder, currentOrder - 1]);
      } else {
        await this.knex('areaOrder')
          .update({ sortOrder: sortOrder - 1 })
          .whereBetween('sortOrder', [currentOrder + 1, sortOrder]);
      }

      const updatedId = await this.knex('areaOrder')
        .where({ areaKey: key })
        .update({ sortOrder });

      if (!updatedId) {
        log.error(`Failed to set areaOrder with key: ${key}`);
        throw new Error(`Failed to set areaOrder with key: ${key}`);
      }
      const areaOrder = await this.getAreaOrder(key);

      return areaOrder;
    } catch (err) {
      log.error(`Failed to set areaOrder with key: ${key} - ${err}`);
      throw err;
    }
  }

  /* Areas */
  async getAreas(): Promise<Area[]> {
    return this.knex.select('*').from('area');
  }

  async getArea(key: string): Promise<Area> {
    try {
      const area = await this.knex()
        .select('*')
        .from('area')
        .where({ key })
        .first();
      return area;
    } catch (err) {
      log.error(`Failed to get area with key: ${key} - ${err}`);
      throw err;
    }
  }

  async createArea(
    key: string,
    name: string,
    description: string
  ): Promise<Area> {
    try {
      const insertedId = await this.knex
        .insert({
          key,
          name,
          deleted: false,
          description,
          lastUpdatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        })
        .into('area');
      if (insertedId) {
        this.createAreaOrder(key);
        this.createView(key, name, '', 'area');

        return await this.knex
          .select('*')
          .from('area')
          .where({ id: insertedId[0] })
          .first();
      }
      log.error(`Failed to create area with key: ${key}`);
      throw new Error(`Failed to create area with key: ${key}`);
    } catch (err) {
      log.error(`Failed to create area with key: ${key} - ${err}`);
      throw err;
    }
  }

  async deleteArea(key: string): Promise<Area> {
    try {
      const deletedId = await this.knex('area').where({ key }).update({
        deleted: true,
        lastUpdatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
      });

      if (deletedId) {
        const items = await this.knex('item')
          .select('*')
          .where({ areaKey: key });
        items.map((i) => this.setAreaOfItem(i.key, '0'));
        const projects = await this.knex('project')
          .select('*')
          .where({ areaKey: key });

        projects.map((p) => this.setAreaOfProject(p.key, '0'));

        const area = await this.getArea(key);
        return area;
      }
      log.error(`Failed to delete area with key: ${key}`);
      throw new Error(`Failed to delete area with key: ${key}`);
    } catch (err) {
      log.error(`Failed to delete area with key: ${key} - ${err}`);
      throw err;
    }
  }

  async renameArea(key: string, name: string): Promise<Area> {
    try {
      const updatedId = await this.knex('area')
        .where({ key })
        .update({ name, lastUpdatedAt: new Date().toISOString() });
      if (updatedId) {
        return await this.getArea(key);
      }
      log.error(`Failed to rename area with key: ${key}`);
      throw new Error(`Failed to rename area with key: ${key}`);
    } catch (err) {
      log.error(`Failed to rename area - ${key} - ${name}:  ${err}`);
      throw err;
    }
  }

  async setDescriptionOfArea(key: string, description: string): Promise<Area> {
    try {
      const updatedId = await this.knex('area')
        .where({ key })
        .update({ description, lastUpdatedAt: new Date().toISOString() });
      if (updatedId) {
        return await this.getArea(key);
      }
      log.error(`Failed to update description of area with key: ${key}`);
      throw new Error(`Failed to update description of area with key: ${key}`);
    } catch (err) {
      log.error(
        `Failed to update description of area with key: - ${key} - ${description}:  ${err}`
      );
      throw err;
    }
  }

  async setEmojiOfArea(key: string, emoji: string): Promise<Area> {
    try {
      const updatedId = await this.knex('area')
        .where({ key })
        .update({ emoji, lastUpdatedAt: new Date().toISOString() });
      if (updatedId) {
        return await this.getArea(key);
      }
      log.error(`Failed to update emoji of area with key: ${key}`);
      throw new Error(`Failed to update emoji of area with key: ${key}`);
    } catch (err) {
      log.error(
        `Failed to update emoji of area with key: - ${key} - ${emoji}:  ${err}`
      );
      throw err;
    }
  }

  /* ItemOrders */
  async getItemOrders(): Promise<ItemOrder[]> {
    return this.knex('itemOrder');
  }

  async getItemOrder(key: string): Promise<ItemOrder> {
    try {
      const itemOrder = await this.knex()
        .select('*')
        .from('itemOrder')
        .where({ key })
        .first();
      if (!itemOrder) {
        log.error(`Failed to get itemOrder with key: ${key}`);
        throw new Error(`ItemOrder with key: ${key} not found`);
      }
      return itemOrder;
    } catch (err) {
      log.error(`Failed to get itemOrder with key: ${key} - ${err}`);
      throw err;
    }
  }

  async getItemOrdersByComponent(componentKey: string): Promise<ItemOrder[]> {
    try {
      const itemOrders = await this.knex()
        .select('*')
        .from('itemOrder')
        .where({ componentKey });
      if (!itemOrders) {
        log.error(
          `Failed to get itemOrders with componentKey: ${componentKey}`
        );
        throw new Error(
          `ItemOrders with componentKey: ${componentKey} not found`
        );
      }
      return itemOrders;
    } catch (err) {
      log.error(
        `Failed to get itemOrders with componentKey: ${componentKey} - ${err}`
      );
      throw err;
    }
  }

  async createItemOrder(
    itemKey: string,
    componentKey: string
  ): Promise<ItemOrder> {
    try {
      const maxSortOrder = await this.knex
        .max('sortOrder as max')
        .from('itemOrder')
        .first();

      const insertedId = await this.knex
        .insert({
          itemKey,
          componentKey,
          sortOrder: maxSortOrder ? maxSortOrder?.max + 1 : 0,
        })
        .into('itemOrder');
      if (!insertedId) {
        log.error(
          `Failed to create itemOrder with itemKey: ${itemKey}, componentKey: ${componentKey}`
        );
        throw new Error(
          `Failed to create areaOrder with itemKey: ${itemKey}, componentKey: ${componentKey}`
        );
      }
      const itemOrder = await this.getItemOrder(itemKey);
      return itemOrder;
    } catch (err) {
      log.error(`Failed to create itemOrder with itemKey: ${itemKey} - ${err}`);
      throw err;
    }
  }

  async bulkCreateItemOrders(
    itemOrders: string[],
    componentKey: string
  ): Promise<ItemOrder[]> {
    try {
      const maxSortOrder = await this.knex
        .max('sortOrder as max')
        .from('itemOrder')
        .first();

      const inserted = await this.knex.batchInsert(
        'itemOrder',
        itemOrders.map((itemKey, idx) => ({
          itemKey,
          componentKey,
          sortOrder: maxSortOrder ? maxSortOrder?.max + idx + 1 : 1,
        }))
      );
      // TODO: I think this is the wrong return type
      if (!inserted) {
        log.error(`Failed to create itemOrders`);
        throw new Error(`Failed to create itemOrders`);
      }
      return await Promise.all(
        inserted.map((i) =>
          this.knex.select('*').from('itemOrder').where({ key: i }).first()
        )
      );
    } catch (err) {
      log.error(
        `Failed to  bulk create itemOrders with itemKeys: ${itemOrders} - ${err}`
      );
      throw err;
    }
  }

  async setItemOrder(
    itemKey: string,
    componentKey: string,
    sortOrder: number
  ): Promise<ItemOrder> {
    try {
      const currentItemOrder = await this.getItemOrder(itemKey);
      const currentOrder = currentItemOrder.sortOrder;
      if (sortOrder < currentOrder) {
        await this.knex('itemOrder')
          .update({ sortOrder: sortOrder + 1 })
          .whereBetween('sortOrder', [sortOrder, currentOrder - 1])
          .where({ componentKey });
      } else {
        await this.knex('itemOrder')
          .update({ sortOrder: sortOrder - 1 })
          .whereBetween('sortOrder', [currentOrder + 1, sortOrder])
          .where({ componentKey });
      }
      const itemOrderId = this.knex('itemOrder')
        .where({ itemKey, componentKey })
        .update({ sortOrder });

      if (!itemOrderId) {
        log.error(
          `Failed to set itemOrder with itemKey: ${itemKey}, componentKey: ${componentKey}`
        );
        throw new Error(
          `Failed to set itemOrder with itemKey: ${itemKey}, componentKey: ${componentKey}`
        );
      }
      const itemOrder = await this.getItemOrder(itemKey);
      return itemOrder;
    } catch (err) {
      log.error(`Failed to set itemOrder with itemKey: ${itemKey} - ${err}`);
      throw err;
    }
  }

  async deleteItemOrders(itemKeys: string[], componentKey: string) {
    const deletedIds = await this.knex('itemOrder')
      .whereIn('itemKey', itemKeys)
      .where({ componentKey })
      .delete();
    return deletedIds;
  }

  async deleteItemOrder(itemKey: string, componentKey: string) {
    const deletedId = await this.knex('itemOrder')
      .where({ itemKey, componentKey })
      .delete();
    return deletedId;
  }

  async deleteItemOrdersByComponent(componentKey: string): Promise<string> {
    return (
      await this.knex('itemOrder').where({ componentKey }).delete()
    ).toString();
  }

  /* Items */

  async getItems(): Promise<Item[]> {
    return this.knex.select('*').from('item');
  }

  async getItem(key: string): Promise<Item> {
    try {
      const item = await this.knex()
        .select('*')
        .from('item')
        .where({ key })
        .first();
      return item;
    } catch (err) {
      log.error(`Failed to get item with key: ${key} - ${err}`);
      throw err;
    }
  }

  async getItemsByProject(projectKey: string): Promise<Item[]> {
    try {
      const item = await this.knex()
        .select('*')
        .from('item')
        .where({ projectKey });
      return item;
    } catch (err) {
      log.error(`Failed to get item with projectKey: ${projectKey} - ${err}`);
      throw err;
    }
  }

  async getItemsByArea(areaKey: string): Promise<Item[]> {
    try {
      const item = await this.knex()
        .select('*')
        .from('item')
        .where({ areaKey });
      return item;
    } catch (err) {
      log.error(`Failed to get item with areaKey: ${areaKey} - ${err}`);
      throw err;
    }
  }

  async getItemsByParent(parentKey: string): Promise<Item[]> {
    try {
      const item = await this.knex()
        .select('*')
        .from('item')
        .where({ parentKey });
      return item;
    } catch (err) {
      log.error(`Failed to get item with parentKey: ${parentKey} - ${err}`);
      throw err;
    }
  }

  async getFilteredItems(
    filter: string,
    componentKey: string
  ): Promise<Item[]> {
    const valueProcessor = (
      field: string,
      operator: string,
      value: any
    ): string => {
      const dateField = [
        'DATE(dueAt)',
        'DATE(completedAt)',
        'DATE(scheduledAt)',
        'DATE(deletedAt)',
        'DATE(lastUpdatedAt)',
        'DATE(createdAt)',
      ].includes(field);

      const booleanField = ['completed', 'deleted'].includes(field);
      if (booleanField) {
        return (!!value).toString();
      }
      if (dateField) {
        /*
          This craziness is because we are using a BETWEEN operator
        */
        if (value === 'past') {
          return `DATE(date('now', '-10 year')) AND DATE(date('now', '-1 day'))`;
        }
        if (value === 'today') {
          return `DATE(date()) AND DATE(date())`;
        }
        if (value === 'tomorrow') {
          return `DATE(date('now', '+1 day')) AND DATE(date('now', '+1 day'))`;
        }
        if (value === 'week') {
          return `strftime('%Y-%m-%d', 'now', 'localtime', 'weekday 0', '-6 days') AND strftime('%Y-%m-%d', 'now', 'localtime', 'weekday 0')`;
        }
        if (value === 'month') {
          return `strftime('%Y-%m-%d', 'now', 'localtime', 'weekday 0', '-1 month') AND strftime('%Y-%m-%d', 'now', 'localtime', 'weekday 0')`;
        }
      }
      return defaultValueProcessor(field, operator, value);
    };

    // Parse string into object
    const parseFilters = (
      filterString: string
    ): { combinator: 'and'; rules: [] } | null => {
      // Return an empty object
      if (!filterString) return null;
      try {
        return JSON.parse(filterString);
      } catch (e) {
        log.error(`Failed to parse filters - ${e}`);
        return null;
      }
    };

    const generateQueryString = (
      query: {
        combinator: 'and';
        rules: [];
      } | null
    ): string => {
      if (!query) return '';

      return formatQuery(query, {
        format: 'sql',
        valueProcessor,
      });
    };

    const filters = parseFilters(filter);

    const filterString = generateQueryString(filters);

    const items = await this.knex('item').select('*').whereRaw(filterString);
    const orders = await this.getItemOrdersByComponent(componentKey);

    const orderKeys = orders.map((o: ItemOrder) => o.item.key);
    const itemKeys = items.map((r) => r.key);

    // Delete itemOrders
    const inOrderButNotResult = without(orderKeys, ...itemKeys);
    await this.deleteItemOrders(inOrderButNotResult, componentKey);

    // Add new ones
    const inResultButNotOrder = without(itemKeys, ...orderKeys);
    await this.bulkCreateItemOrders(inResultButNotOrder, componentKey);

    return items;
  }

  async createItem(
    key: string,
    dueAt: Date,
    labelKey: string,
    parentKey: string,
    projectKey: string,
    repeat: string,
    scheduledAt: Date,
    text: string,
    type: string
  ): Promise<Item> {
    try {
      // Get the parent to inherit some values
      const parent = parentKey ? null : await this.getItem(parentKey);
      const areaKey = parent?.area ? parent?.area?.key : '';
      const parentProjectKey = parent?.project
        ? parent?.project?.key
        : projectKey;

      const insertedId = await this.knex({
        key,
        dueAt: dueAt?.toISOString() ?? '',
        labelKey,
        parentKey,
        projectKey: parentProjectKey,
        repeat,
        scheduledAt: scheduledAt?.toISOString() ?? '',
        text,
        type,
        areaKey,
        createdAt: new Date().toISOString(),
      }).into('item');

      if (insertedId) {
        return await this.knex
          .select('*')
          .from('tem')
          .where({ id: insertedId[0] })
          .first();
      }
      log.error('Failed to create item without error');
      throw new Error('Failed to create item');
    } catch (e) {
      log.error(`Failed to create item - ${e}`);
      throw e;
    }
  }

  async deleteItem(key: string): Promise<Item> {
    try {
      // TODO: Check if the item is deleted
      const children = await this.getItemsByParent(key);
      if (children) {
        children.map((c) => {
          return this.deleteItem(c.key);
        });
      }
      const deletedItemId = await this.knex('item')
        .where({ key })
        .update({
          deleted: true,
          deletedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
        })
        .first();

      if (deletedItemId) {
        return await this.getItem(key);
      }
      log.error('Failed to delete item without error');
      throw new Error('Failed to delete item');
    } catch (e) {
      log.error(`Failed to delete item - ${e}`);
      throw e;
    }
  }

  async restoreItem(key: string): Promise<Item> {
    try {
      // TODO: Check if the item is deleted
      const children = await this.getItemsByParent(key);
      if (children) {
        children.map((c) => {
          return this.restoreItem(c.key);
        });
      }
      const restoredItemId = await this.knex('item').where({ key }).update({
        deleted: false,
        deletedAt: null,
        lastUpdatedAt: new Date().toISOString(),
      });

      if (restoredItemId) {
        return await this.getItem(key);
      }
      log.error('Failed to restore item without error');
      throw new Error('Failed to restore item');
    } catch (e) {
      log.error(`Failed to restore item - ${e}`);
      throw e;
    }
  }

  async renameItem(key: string, text: string): Promise<Item> {
    try {
      // TODO: Check if the item is deleted
      const renamedItemId = await this.knex('item').where({ key }).update({
        text,
        lastUpdatedAt: new Date().toISOString(),
      });
      if (renamedItemId) {
        return await this.getItem(key);
      }
      log.error('Failed to rename item without error');
      throw new Error('Failed to rename item');
    } catch (e) {
      log.error(`Failed to rename item - ${e}`);
      throw e;
    }
  }

  async completeItem(key: string): Promise<Item> {
    try {
      const item = await this.getItem(key);
      if (item.repeat) {
        const nextDate = rrulestr(item.repeat).after(new Date());
        if (!nextDate) {
          return await this.knex('item').where({ key }).update({
            dueAt: null,
            scheduledAt: null,
            completed: true,
            completedAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
          });
        }
        const updatedId = await this.knex('item').where({ key }).update({
          dueAt: nextDate.toISOString(),
          scheduledAt: null,
          completed: false,
          lastUpdatedAt: new Date().toISOString(),
        });
        if (updatedId) {
          return await this.getItem(key);
        }
        log.error('Failed to complete item without error');
        throw new Error('Failed to complete item');
      }
      return await this.knex('item').where({ key }).update({
        completed: true,
        completedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      });
    } catch (e) {
      log.error(`Failed to complete item - ${e}`);
      throw e;
    }
  }

  async unCompleteItem(key: string): Promise<Item> {
    try {
      await this.getItem(key);
      // What should happen if an item has a repeat?
      // if (item.repeat) {}

      const updatedId = await this.knex('item').where({ key }).update({
        completed: false,
        completedAt: null,
        lastUpdatedAt: new Date().toISOString(),
      });
      if (updatedId) {
        return await this.getItem(key);
      }
      log.error('Failed to uncomplete item without error');
      throw new Error('Failed to uncomplete item');
    } catch (e) {
      log.error(`Failed to uncomplete item - ${e}`);
      throw e;
    }
  }

  async setRepeatOfItem(key: string, repeat: string): Promise<Item> {
    try {
      const nextRepeatDate = rrulestr(repeat).after(new Date());
      const updatedId = await this.knex('item').where({ key }).update({
        repeat,
        dueAt: nextRepeatDate,
        lastUpdatedAt: new Date().toISOString(),
      });
      if (updatedId) {
        return await this.getItem(key);
      }
      log.error('Failed to set repeat of item without error');
      throw new Error('Failed to set repeat of item');
    } catch (e) {
      log.error(`Failed to set repeat of item - ${e}`);
      throw e;
    }
  }

  async setProjectOfItem(key: string, projectKey: string): Promise<Item> {
    try {
      const updatedId = await this.knex('item').where({ key }).update({
        projectKey,
        lastUpdatedAt: new Date().toISOString(),
      });
      if (updatedId) {
        const children = await this.getItemsByParent(key);
        if (children.length) {
          children.map((c) => {
            return this.setProjectOfItem(c.key, projectKey);
          });
        }
        return await this.knex('item').where({ key }).first();
      }
      log.error(`Failed to set project of item without error`);
      throw new Error(`Failed to set project of item`);
    } catch (e) {
      log.error(`Failed to set project of item - ${e}`);
      throw e;
    }
  }

  async setAreaOfItem(key: string, areaKey: string): Promise<Item> {
    try {
      const updatedId = await this.knex('item').where({ key }).update({
        areaKey,
        lastUpdatedAt: new Date().toISOString(),
      });
      if (updatedId) {
        const children = await this.getItemsByParent(key);
        if (children.length) {
          children.map((c) => {
            return this.setAreaOfItem(c.key, areaKey);
          });
        }
        return await this.knex('item').where({ key }).first();
      }
      log.error('Failed to set area of item without error');
      throw new Error('Failed to set area of item');
    } catch (e) {
      log.error(`Failed to set area of item - ${e}`);
      throw e;
    }
  }

  async setScheduledAtOfItem(key: string, scheduledAt: Date): Promise<Item> {
    try {
      const updatedId = await this.knex('item')
        .where({ key })
        .update({ scheduledAt, lastUpdatedAt: new Date().toISOString() });

      if (updatedId) {
        return await this.getItem(key);
      }
      log.error('Failed to set scheduled at of item without error');
      throw new Error('Failed to set scheduled at of item');
    } catch (e) {
      log.error(`Failed to set scheduled at of item - ${e}`);
      throw e;
    }
  }

  async setDueAtOfItem(key: string, dueAt: Date): Promise<Item> {
    try {
      const updatedId = await this.knex('item')
        .where({ key })
        .update({ dueAt, lastUpdatedAt: new Date().toISOString() });

      if (updatedId) {
        return await this.getItem(key);
      }
      log.error('Failed to set due at of item without error');
      throw new Error('Failed to set due at of item');
    } catch (e) {
      log.error(`Failed to set due at of item - ${e}`);
      throw e;
    }
  }

  async cloneItem(key: string): Promise<Item> {
    const newKey = uuidv4();
    const item = await this.getItem(key);
    return this.createItem(
      newKey,
      item.dueAt,
      item.label?.key ?? '',
      item.parent?.key ?? '',
      item.project?.key ?? '',
      item.repeat ?? '',
      item.scheduledAt,
      item.text ?? '',
      item.type ?? ''
    );
  }

  async setParentOfItem(key: string, parentKey: string): Promise<Item> {
    try {
      const children = await this.getItemsByParent(key);
      if (children.length) {
        log.error(`Can't set parent of item as it already has a parent`);
        throw new Error("Can't set parent of item as it already has a parent");
      }
      const updatedId = await this.knex('item').where({ key }).update({
        parentKey,
        lastUpdatedAt: new Date().toISOString(),
      });

      if (updatedId) {
        return await this.getItem('key');
      }
      log.error(`Failed to update parent of item`);
      throw new Error(`Failed to update parent of item`);
    } catch (e) {
      log.error(`Failed to set parent of item - ${e}`);
      throw e;
    }
  }

  async permanentDeleteItem(key: string): Promise<string> {
    try {
      // TODO: What about deleting children?
      const deletedId = await this.knex('item').where({ key }).delete();
      if (deletedId) {
        return deletedId.toString();
      }
      log.error('Failed to permanent delete item without error');
      throw new Error('Failed to permanent delete item');
    } catch (e) {
      log.error(`Failed to permanent delete item - ${e}`);
      throw e;
    }
  }

  async setLabelOfItem(key: string, labelKey: string): Promise<Item> {
    try {
      const updatedId = await this.knex('item').where({ key }).update({
        labelKey,
        lastUpdatedAt: new Date().toISOString(),
      });
      if (updatedId) {
        const children = await this.getItemsByParent(key);
        if (children.length) {
          children.map((c) => {
            return this.setLabelOfItem(c.key, labelKey);
          });
        }
        const item = await this.knex('item').where({ key }).first();
        return item;
      }
      log.error('Failed to set label of item without error');
      throw new Error('Failed to set label of item');
    } catch (e) {
      log.error(`Failed to set label of item - ${e}`);
      throw e;
    }
  }

  /* Features */
  async getFeatures(): Promise<Feature[]> {
    return this.knex.select('*').from('feature');
  }

  async getFeature(key: string): Promise<Feature> {
    try {
      const feature = await this.knex()
        .select('*')
        .from('feature')
        .where({ key })
        .first();
      if (feature) {
        return feature;
      }
      log.error('Failed to get feature without error');
      throw new Error('Failed to get feature');
    } catch (err) {
      log.error(`Failed to get feature with key: ${key} - ${err}`);
      throw err;
    }
  }

  async getFeatureByName(name: string): Promise<Feature> {
    try {
      const feature = await this.knex()
        .select('*')
        .from('feature')
        .where({ name })
        .first();
      if (feature) {
        return feature;
      }
      log.error('Failed to get feature without error');
      throw new Error('Failed to get feature');
    } catch (err) {
      log.error(`Failed to get feature with key: ${name} - ${err}`);
      throw err;
    }
  }

  async setFeature(key: string, enabled: boolean): Promise<Feature> {
    try {
      const updatedId = await this.knex('feature')
        .where({ key })
        .update({ enabled });
      if (updatedId) {
        return await this.getFeature(key);
      }
      log.error('Failed to set feature without error');
      throw new Error('Failed to set feature');
    } catch (e) {
      log.error(`Failed to set feature - ${key}:  ${e}`);
      throw e;
    }
  }

  async setFeatureMetadata(
    key: string,
    metadata: Record<string, unknown>
  ): Promise<Feature> {
    try {
      const updatedId = await this.knex('feature')
        .where({ key })
        .update({ metadata });
      if (updatedId) {
        return await this.getFeature(key);
      }
      log.error('Failed to set feature metadata without error');
      throw new Error('Failed to set feature metadata');
    } catch (e) {
      log.error(`Failed to set feature metadata- ${key}:  ${e}`);
      throw e;
    }
  }

  async createFeature(
    key: string,
    name: string,
    enabled: boolean,
    metadata: Record<string, unknown>
  ): Promise<Feature> {
    try {
      const insertedId = await this.knex
        .insert({
          key,
          name,
          enabled,
          metadata,
        })
        .into('feature');
      if (insertedId) {
        return await this.knex
          .select('*')
          .from('area')
          .where({ id: insertedId[0] })
          .first();
      }
      log.error('Failed to create feature without error');
      throw new Error('Failed to create feature');
    } catch (e) {
      log.error(`Failed to create feature - ${e}`);
      throw e;
    }
  }

  /* Labels */

  async getLabels(): Promise<Label[]> {
    try {
      return await this.knex.select('*').from('label');
    } catch (e) {
      log.error(`Failed to get labels - ${e}`);
      throw e;
    }
  }

  async getLabel(key: string): Promise<Label> {
    try {
      const label = await this.knex('label').where({ key }).first();
      if (label) {
        return label;
      }
      log.error('Failed to get label without error');
      throw new Error('Failed to get label');
    } catch (err) {
      log.error(`Failed to get label with key: ${key} - ${err}`);
      throw err;
    }
  }

  async createLabel(key: string, name: string, colour: string): Promise<Label> {
    try {
      const newLabel = await this.knex('label').insert({ key, name, colour });
      if (newLabel) {
        return await this.getLabel(key);
      }
      log.error('Failed to create label without error');
      throw new Error('Failed to create label');
    } catch (e) {
      log.error(`Failed to create label - ${e}`);
      throw e;
    }
  }

  async renameLabel(key: string, name: string): Promise<Label> {
    try {
      const updatedId = await this.knex('label')
        .where({ key })
        .update({ name });
      if (updatedId) {
        return await this.getLabel(key);
      }
      log.error('Failed to rename label without error');
      throw new Error('Failed to rename label');
    } catch (e) {
      log.error(`Failed to rename label - ${e}`);
      throw e;
    }
  }

  async setColourOfLabel(key: string, colour: string): Promise<Label> {
    try {
      const updatedId = await this.knex('label')
        .where({ key })
        .update({ colour });
      if (updatedId) {
        return await this.getLabel(key);
      }
      log.error('Failed to set colour of label without error');
      throw new Error('Failed to set colour of label');
    } catch (e) {
      log.error(`Failed to set colour of label - ${e}`);
      throw e;
    }
  }

  async deleteLabel(key: string): Promise<string> {
    try {
      const updatedId = await this.knex('label').where({ key }).del();
      if (updatedId) {
        return key;
      }
      log.error('Failed to delete label without error');
      throw new Error('Failed to delete label');
    } catch (e) {
      log.error(`Failed to delete label - ${e}`);
      throw e;
    }
  }

  /* Reminder */
  async getReminders(): Promise<Reminder[]> {
    try {
      return await this.knex.select('*').from('reminder');
    } catch (e) {
      log.error(`Failed to get reminders - ${e}`);
      throw e;
    }
  }

  async getReminder(key: string): Promise<Reminder> {
    try {
      const reminder = await this.knex('reminder').where({ key }).first();
      return reminder;
    } catch (err) {
      log.error(`Failed to get reminder with key: ${key} - ${err}`);
      throw err;
    }
  }

  async getRemindersByItem(itemKey: string): Promise<Reminder[]> {
    try {
      const items = await this.knex('reminder').where({ itemKey }).select('*');
      if (items) {
        return items;
      }
      log.error('Failed to get reminders by item without error');
      throw new Error('Failed to get reminders by item');
    } catch (err) {
      log.error(`Failed to get reminders with item key: ${itemKey} - ${err}`);
      throw err;
    }
  }

  async createReminder(
    key: string,
    text: string,
    remindAt: Date,
    itemKey: string
  ): Promise<Reminder> {
    try {
      const insertedId = await this.knex('reminder').insert({
        key,
        text,
        remindAt,
        itemKey,
        lastUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      if (insertedId) {
        return await this.getReminder(key);
      }
      log.error('Failed to create reminder without error');
      throw new Error('Failed to create reminder');
    } catch (e) {
      log.error(`Failed to create reminder - ${e}`);
      throw e;
    }
  }

  async deleteReminder(key: string): Promise<Reminder> {
    try {
      const updatedId = await this.knex('reminder')
        .update({
          deleted: true,
          deletedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
        })
        .where({ key });
      if (updatedId) {
        return await this.getReminder(key);
      }
      log.error('Failed to delete reminder without error');
      throw new Error('Failed to delete reminder');
    } catch (e) {
      log.error(`Failed to delete reminder - ${e}`);
      throw e;
    }
  }

  async deleteReminderFromItem(itemKey: string): Promise<Reminder> {
    try {
      const updatedId = await this.knex('reminder')
        .update({
          deleted: true,
          deletedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
        })
        .where({ itemKey });
      if (updatedId) {
        return await this.getReminder(itemKey);
      }
      log.error('Failed to delete reminder from item without error');
      throw new Error('Failed to delete reminder from item');
    } catch (e) {
      log.error(`Failed to delete reminder from item - ${e}`);
      throw e;
    }
  }

  /* Component */
  async getComponents(): Promise<Component[]> {
    try {
      return await this.knex.select('*').from('component');
    } catch (e) {
      log.error(`Failed to get components - ${e}`);
      throw e;
    }
  }

  async getComponent(key: string): Promise<Component> {
    try {
      const component = await this.knex('component').where({ key }).first();
      if (component) {
        return component;
      }
      log.error('Failed to get component without error');
      throw new Error('Failed to get component');
    } catch (err) {
      log.error(`Failed to get component with key: ${key} - ${err}`);
      throw err;
    }
  }

  async getComponentByView(viewKey: string): Promise<Component[]> {
    try {
      const components = await this.knex('component').where({ viewKey });
      if (components) {
        return components;
      }
      log.error('Failed to get component by view without error');
      throw new Error('Failed to get component by view');
    } catch (err) {
      log.error(`Failed to get component with key: ${viewKey} - ${err}`);
      throw err;
    }
  }

  async createComponent(
    key: string,
    viewKey: string,
    location: string,
    type: string,
    parameters: Record<string, any>
  ): Promise<Component> {
    try {
      const insertedId = await this.knex('component').insert({
        key,
        viewKey,
        location,
        type,
        parameters,
      });
      if (insertedId) {
        return await this.getComponent(key);
      }
      log.error('Failed to create component without error');
      throw new Error('Failed to create component');
    } catch (e) {
      log.error(`Failed to create component - ${e}`);
      throw e;
    }
  }

  // TODO: Make this a transaction
  async cloneComponent(key: string): Promise<Component> {
    try {
      const newKey = uuidv4();
      const component = await this.getComponent(key);
      if (component) {
        const newParams = component.parameters
          ? JSON.parse(component?.parameters)
          : '';

        const newComponent = await this.createComponent(
          newKey,
          component.viewKey,
          component.location,
          component.type,
          newParams
        );
        if (newComponent) {
          await this.createComponentOrder(newKey);
          return component;
        }
      }
      log.error('Failed to clone component without error');
      throw new Error('Failed to clone component');
    } catch (e) {
      log.error(`Failed to clone component - ${e}`);
      throw e;
    }
  }

  // TODO: Remove all item orders when deleting a component #339
  async deleteComponent(key: string): Promise<string> {
    try {
      const deletedId = await this.knex('component').where({ key }).del();
      if (deletedId) {
        return key;
      }
      log.error('Failed to delete component without error');
      throw new Error('Failed to delete component');
    } catch (e) {
      log.error(`Failed to delete component - ${e}`);
      throw e;
    }
  }

  async setParametersOfComponent(
    key: string,
    parameters: Record<string, any>
  ): Promise<Component> {
    try {
      const updatedId = await this.knex('component')
        .where({ key })
        .update({ parameters });
      if (updatedId) {
        return await this.getComponent(key);
      }
      log.error('Failed to set parameters of component without error');
      throw new Error('Failed to set parameters of component');
    } catch (e) {
      log.error(`Failed to set parameters of component - ${e}`);
      throw e;
    }
  }

  async updateComponentOnProjectNameChange(viewKey: string, name: string) {
    const components = await this.knex('component').where({
      viewKey,
      type: 'FilteredItemList',
    });
    components.forEach((component: Component) => {
      if (!component.parameters) return;

      const params = JSON.parse(component.parameters);
      const filter = JSON.parse(params.filter);
      filter.text = filter.text.replace(
        /project = ".+"/,
        `project = "${name}"`
      );
      params.filter = JSON.stringify(filter);
      this.setParametersOfComponent(component.key, params);
    });
  }

  /* Component Order */
  async getComponentOrders(): Promise<ComponentOrder[]> {
    try {
      return await this.knex.select('*').from('componentOrder');
    } catch (e) {
      log.error(`Failed to get component orders - ${e}`);
      throw e;
    }
  }

  async getComponentOrder(key: string): Promise<ComponentOrder> {
    try {
      const componentOrder = await this.knex('componentOrder')
        .where({ key })
        .first();
      if (componentOrder) {
        return componentOrder;
      }
      log.error('Failed to get component order without error');
      throw new Error('Failed to get component order');
    } catch (e) {
      log.error(`Failed to get component order - ${e}`);
      throw e;
    }
  }

  async createComponentOrder(key: string): Promise<ComponentOrder> {
    try {
      const maxSortOrder = await this.knex
        .max('sortOrder as max')
        .from('componentOrder')
        .first();

      const insertedId = await this.knex
        .insert({
          key,
          sortOrder: maxSortOrder ? maxSortOrder?.max + 1 : 0,
        })
        .into('areaOrder');
      if (insertedId) {
        return await this.getComponentOrder(key);
      }
      log.error('Failed to create component order without error');
      throw new Error('Failed to create component order');
    } catch (e) {
      log.error(`Failed to create component order - ${e}`);
      throw e;
    }
  }

  // TODO: Wrap this in a transaction
  async setComponentOrder(
    key: string,
    sortOrder: number
  ): Promise<ComponentOrder> {
    try {
      const currentcomponentOrder = await this.getComponentOrder(key);
      const currentOrder = currentcomponentOrder.sortOrder;
      if (sortOrder < currentOrder) {
        await this.knex('componentOrder')
          .update({ sortOrder: sortOrder + 1 })
          .whereBetween('sortOrder', [sortOrder, currentOrder - 1]);
      } else {
        await this.knex('componentOrder')
          .update({ sortOrder: sortOrder - 1 })
          .whereBetween('sortOrder', [currentOrder + 1, sortOrder]);
      }

      const updatedComponentOrderId = await this.knex('componentOrder')
        .where({ componentKey: key })
        .update({ sortOrder });
      if (updatedComponentOrderId) {
        return await this.getComponentOrder(key);
      }
      log.error('Failed to set component order without error');
      throw new Error('Failed to set component order');
    } catch (e) {
      log.error(`Failed to set component order - ${e}`);
      throw e;
    }
  }

  /* Calendar */
  async getCalendars(): Promise<Calendar[]> {
    return this.knex.select('*').from('calendar');
  }

  async getCalendar(key: string): Promise<Calendar> {
    try {
      const calendar = await this.knex('calendar').where({ key }).first();
      if (calendar) {
        return calendar;
      }
      log.error('Failed to get calendar without error');
      throw new Error('Failed to get calendar');
    } catch (err) {
      log.error(`Failed to get calendar with key: ${key} - ${err}`);
      throw err;
    }
  }

  async getActiveCalendar(): Promise<Calendar> {
    try {
      const calendar = await this.knex('calendar')
        .where({ active: true })
        .first();
      if (calendar) {
        return calendar;
      }
      log.error('Failed to get active calendar without error');
      throw new Error('Failed to get active calendar');
    } catch (err) {
      log.error(`Failed to get active calendar - ${err}`);
      throw err;
    }
  }

  async createCalendar(
    key: string,
    name: string,
    active: boolean
  ): Promise<Calendar> {
    try {
      const insertedId = await this.knex('calendar').insert({
        key,
        name,
        active,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      });
      if (insertedId) {
        return await this.getCalendar(key);
      }
      log.error('Failed to create calendar without error');
      throw new Error('Failed to create calendar');
    } catch (err) {
      log.error(`Failed to create calendar with key: ${key} - ${err}`);
      throw err;
    }
  }

  async deleteCalendar(key: string): Promise<Calendar> {
    try {
      const deletedId = await this.knex('calendar').where({ key }).update({
        deleted: true,
        deletedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      });
      if (deletedId) {
        return await this.getCalendar(key);
      }
      log.error('Failed to delete calendar without error');
      throw new Error('Failed to delete calendar');
    } catch (err) {
      log.error(`Failed to delete calendar with key: ${key} - ${err}`);
      throw err;
    }
  }

  async setActiveCalendar(key: string): Promise<Calendar> {
    // TODO: Setting a deleted calendar active
    try {
      await this.knex('calendar').update({
        active: false,
        lastUpdatedAt: new Date().toISOString(),
      });

      const updatedId = await this.knex('calendar')
        .where({ key })
        .update({ active: true, lastUpdatedAt: new Date().toISOString() });
      if (updatedId) {
        return await this.getCalendar(key);
      }
      log.error('Failed to set active calendar without error');
      throw new Error('Failed to set active calendar');
    } catch (err) {
      log.error(`Failed to set active calendar with key: ${key} - ${err}`);
      throw err;
    }
  }

  /* Events */
  async getEvents(): Promise<Event[]> {
    try {
      return await this.knex.select('*').from('event');
    } catch (err) {
      log.error(`Failed to get events - ${err}`);
      throw err;
    }
  }

  async getEvent(key: string): Promise<Event> {
    try {
      return await this.knex('event').where({ key }).first();
    } catch (err) {
      log.error(`Failed to get event with key: ${key} - ${err}`);
      throw err;
    }
  }

  async getEventsByCalendar(calendarKey: string): Promise<Event[]> {
    try {
      return await this.knex('event').where({ calendarKey });
    } catch (err) {
      log.error(
        `Failed to get events with calendar key: ${calendarKey} - ${err}`
      );
      throw err;
    }
  }

  async getEventsForActiveCalendar(): Promise<Event[]> {
    try {
      const activeCalendar = await this.getActiveCalendar();
      if (!activeCalendar) {
        log.error(`Failed to get events because there's no active calendar`);
        throw new Error(
          `Failed to get events because there's no active calendar`
        );
      }
      return await this.getEventsByCalendar(activeCalendar.key);
    } catch (err) {
      log.error(`Failed to get events for active calendar - ${err}`);
      throw err;
    }
  }

  async createEvent(
    key: string,
    title: string,
    description: string,
    startAt: Date,
    endAt: Date,
    allDay: boolean,
    calendarKey: string,
    location: string,
    attendees: { name: string; email: string }[],
    recurrence: string
  ): Promise<Event> {
    try {
      const insertedId = await this.knex('event')
        .insert({
          key,
          title,
          description,
          startAt,
          endAt,
          allDay,
          calendarKey,
          createdAt: new Date().toISOString(),
          location,
          attendees: JSON.stringify(attendees),
          recurrence,
        })
        .onConflict('key')
        .merge();
      if (insertedId) {
        return await this.getEvent(key);
      }
      log.error('Failed to create event without error');
      throw new Error('Failed to create event');
    } catch (err) {
      log.error(`Failed to create event with key: ${key} - ${err}`);
      throw err;
    }
  }

  async deleteEvent(key: string): Promise<string> {
    try {
      return await this.knex('event').where({ key }).del();
    } catch (err) {
      log.error(`Failed to delete event with key: ${key} - ${err}`);
      throw err;
    }
  }

  /* Weekly goal */

  async getWeeklyGoals(): Promise<WeeklyGoal[]> {
    return this.knex.select('*').from('weeklyGoal');
  }

  async getWeeklyGoal(key: string): Promise<WeeklyGoal> {
    try {
      return await this.knex('weeklyGoal').where({ key }).first();
    } catch (err) {
      log.error(`Failed to get weekly goal with key: ${key} - ${err}`);
      throw err;
    }
  }

  async getWeeklyGoalByName(name: string): Promise<WeeklyGoal> {
    try {
      return await this.knex('weeklyGoal').where({ name }).first();
    } catch (err) {
      log.error(`Failed to get weekly goal with name: ${name} - ${err}`);
      throw err;
    }
  }

  async createWeeklyGoal(
    key: string,
    week: string,
    goal: string
  ): Promise<WeeklyGoal> {
    try {
      const createdId = await this.knex('weeklyGoal')
        .insert({
          key,
          week,
          goal,
          createdAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
        })
        .onConflict('key')
        .merge();
      if (createdId) {
        return await this.getWeeklyGoal(key);
      }
      log.error('Failed to create weekly goal without error');
      throw new Error('Failed to create weekly goal');
    } catch (err) {
      log.error(`Failed to create weekly goal with key: ${key} - ${err}`);
      throw err;
    }
  }
}

export default AppDatabase;
