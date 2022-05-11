import log from 'electron-log';
import { defaultValueProcessor, formatQuery } from 'react-querybuilder';
import { rrulestr } from 'rrule';
import { without } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { SQLDataSource } from 'datasource-sql';
import { parseISO } from 'date-fns';
import {
  AreaEntity,
  AreaOrderEntity,
  CalendarEntity,
  ComponentEntity,
  ComponentOrderEntity,
  EventEntity,
  FeatureEntity,
  ItemEntity,
  ItemOrderEntity,
  LabelEntity,
  ProjectEntity,
  ProjectOrderEntity,
  ReminderEntity,
  ViewEntity,
  ViewOrderEntity,
  WeeklyGoalEntity,
} from './types';

class AppDatabase extends SQLDataSource {
  /* View Order */

  async getViewOrders(): Promise<ViewOrderEntity[]> {
    log.debug('Getting all view orders');
    return this.knex('viewOrder').select('*');
  }

  async getViewOrder(key: string): Promise<ViewOrderEntity> {
    log.debug(`Getting view order with key: ${key}`);
    try {
      const viewOrder = await this.knex('viewOrder')
        .select<ViewOrderEntity>('*')
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

  async createViewOrder(viewKey: string): Promise<ViewOrderEntity> {
    log.debug(`Creating view order for view: ${viewKey}`);
    const maxSortOrder = await this.knex('viewOrder')
      .max('sortOrder as max')
      .first();

    try {
      await this.knex('viewOrder').insert({
        viewKey,
        sortOrder: maxSortOrder ? maxSortOrder?.max + 1 : 0,
      });

      const insertedRow = await this.knex<ViewOrderEntity>('viewOrder')
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

  async setViewOrder(key: string, sortOrder: number): Promise<ViewOrderEntity> {
    log.debug(`Setting view order for view: ${key} to ${sortOrder}`);
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

  async getViews(): Promise<ViewEntity[]> {
    log.debug('Getting all views');
    return this.knex('view').select('*');
  }

  async getView(key: string): Promise<ViewEntity> {
    log.debug(`Getting view with key: ${key}`);
    try {
      const view = await this.knex('view')
        .select<ViewEntity>('*')
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
  ): Promise<ViewEntity> {
    log.debug(
      `Creating view with key: ${key}, name: ${name}, icon: ${icon}, type: ${type}`
    );
    try {
      const insertedId = await this.knex('view').insert({
        key,
        name,
        icon,
        type,
        deleted: false,
        lastUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      await this.createViewOrder(key);
      const view = await this.getView(key);

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

  async deleteView(key: string): Promise<ViewEntity> {
    log.debug(`Deleting view with key: ${key}`);
    try {
      await this.knex('view').where({ key }).update({
        deleted: true,
        lastUpdatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
      });

      const deletedView = await this.getView(key);

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

  async renameView(key: string, name: string): Promise<ViewEntity> {
    log.debug(`Renaming view with key: ${key} to ${name}`);
    try {
      await this.knex('view')
        .where({ key })
        .update({ name, lastUpdatedAt: new Date().toISOString() });

      const updatedView = await this.getView(key);

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
  async getProjectOrders(): Promise<ProjectOrderEntity[]> {
    log.debug('Getting all project orders');
    return this.knex('projectOrder').select('*');
  }

  async getProjectOrder(projectKey: string): Promise<ProjectOrderEntity> {
    log.debug(`Getting project order with projectKey: ${projectKey}`);
    try {
      const projectOrder = await this.knex('projectOrder')
        .select<ProjectOrderEntity>('*')
        .where({ projectKey })
        .first();

      if (!projectOrder) {
        log.error(`Failed to get project order with key: ${projectKey}`);
        throw new Error(`No projectOrder found with key: ${projectKey}`);
      }
      return projectOrder;
    } catch (err) {
      log.error(`Failed to get projectOrder with key: ${projectKey} - ${err}`);
      throw err;
    }
  }

  async createProjectOrder(projectKey: string): Promise<ProjectOrderEntity> {
    log.debug(`Creating project order with projectKey: ${projectKey}`);
    const maxSortOrder = await this.knex('projectOrder')
      .max('sortOrder as max')
      .first();

    try {
      await this.knex('projectOrder').insert({
        projectKey,
        sortOrder: maxSortOrder ? maxSortOrder?.max + 1 : 0,
      });

      const insertedRow = await this.getProjectOrder(projectKey);

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

  async setProjectOrder(
    key: string,
    sortOrder: number
  ): Promise<ProjectOrderEntity> {
    log.debug(`Setting project order with key: ${key} to ${sortOrder}`);
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
  async getProjects(): Promise<ProjectEntity[]> {
    log.debug('Getting all projects');
    return this.knex('project').select('*');
  }

  async getProject(key: string): Promise<ProjectEntity> {
    log.debug(`Getting project with key: ${key}`);
    try {
      const project = await this.knex('project')
        .select<ProjectEntity>('*')
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

  async getProjectsByArea(areaKey: string): Promise<ProjectEntity[]> {
    log.debug(`Getting projects with areaKey: ${areaKey}`);
    try {
      const projects = await this.knex('project')
        .select('*')
        .where({ areaKey, deleted: false });
      return projects;
    } catch (err) {
      log.error(`Failed to get project with key: ${areaKey} - ${err}`);
      throw err;
    }
  }

  async createProject(
    key: string,
    name: string,
    description: string,
    areaKey?: string
  ): Promise<ProjectEntity> {
    log.debug(
      `Creating project with key: ${key}, name: ${name}, description: ${description}`
    );
    try {
      const insertedId = await this.knex('project').insert({
        key,
        name,
        areaKey,
        deleted: false,
        description,
        lastUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      if (!insertedId) {
        log.error(`Failed to create project with key: ${key}`);
        throw new Error(`Failed to create project with key: ${key}`);
      }

      await this.createProjectOrder(key);
      await this.createView(key, name, '', 'project');

      const insertedProject = await this.getProject(key);

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

  async deleteProject(key: string): Promise<ProjectEntity> {
    log.debug(`Deleting project with key: ${key}`);
    try {
      const deletedId = await this.knex('project').where({ key }).update({
        deleted: true,
        lastUpdatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
      });
      if (deletedId) {
        const items = await this.getItemsByProject(key);
        if (items) {
          items.map((i: ItemEntity) => this.setProjectOfItem(i.key, '0'));
        }
        await this.deleteView(key);
        return await this.getProject(key);
      }
      log.error(`Failed to delete project with key: ${key}`);
      throw new Error(`Failed to delete project with key: ${key}`);
    } catch (err) {
      log.error(`Failed to delete project with key: ${key} - ${err}`);
      throw err;
    }
  }

  async renameProject(key: string, name: string): Promise<ProjectEntity> {
    log.debug(`Renaming project with key: ${key} to ${name}`);
    try {
      const projectId = await this.knex('project')
        .update({ name, lastUpdatedAt: new Date().toISOString() })
        .where({ key });
      if (projectId) {
        this.renameView(key, name);
        this.updateComponentOnProjectNameChange(key, name);
        return await this.getProject(key);
      }
      log.error(`Failed to rename project with key: ${key}`);
      throw new Error(`Failed to rename project with key: ${key}`);
    } catch (err) {
      log.error(`Failed to rename project with key: ${key} - ${err}`);
      throw err;
    }
  }

  async setDescriptionOfProject(
    key: string,
    description: string
  ): Promise<ProjectEntity> {
    log.debug(
      `Setting description of project with key: ${key} to ${description}`
    );
    try {
      const projectId = await this.knex('project')
        .where({ key })
        .update({ description, lastUpdatedAt: new Date().toISOString() });
      if (projectId) {
        return await this.getProject(key);
      }
      log.error(`Failed to set description of project with key: ${key}`);
      throw new Error(`Failed to set description of project with key: ${key}`);
    } catch (err) {
      log.error(
        `Failed to set description of project with key: ${key} - ${err}`
      );
      throw err;
    }
  }

  async setEndDateOfProject(key: string, endAt: Date) {
    log.debug(`Setting end date of project with key: ${key} to ${endAt}`);
    try {
      const projectId = await this.knex('project')
        .where({ key })
        .update({ endAt, lastUpdatedAt: new Date().toISOString() });

      if (projectId) {
        return await this.getProject(key);
      }
      log.error(`Failed to set end date of project with key: ${key}`);
      throw new Error(`Failed to set end date of project with key: ${key}`);
    } catch (err) {
      log.error(`Failed to set end date of project with key: ${key} - ${err}`);
      throw err;
    }
  }

  async setStartDateOfProject(key: string, startAt: Date) {
    log.debug(`Setting start date of project with key: ${key} to ${startAt}`);
    try {
      const projectId = await this.knex('project')
        .where({ key })
        .update({ startAt, lastUpdatedAt: new Date().toISOString() });

      if (projectId) {
        return await this.getProject(key);
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

  async setEmojiOfProject(key: string, emoji: string): Promise<ProjectEntity> {
    log.debug(`Setting emoji of project with key: ${key} to ${emoji}`);
    try {
      const projectId = await this.knex('project')
        .where({ key })
        .update({ emoji, lastUpdatedAt: new Date().toISOString() });

      if (projectId) {
        return await this.getProject(key);
      }
      log.error(`Failed to set emoji of project with key: ${key}`);
      throw new Error(`Failed to set emoji of project with key: ${key}`);
    } catch (err) {
      log.error(`Failed to set emoji of project with key: ${key} - ${err}`);
      throw err;
    }
  }

  async setAreaOfProject(key: string, areaKey: string): Promise<ProjectEntity> {
    log.debug(`Setting area of project with key: ${key} to ${areaKey}`);
    try {
      const projectId = await this.knex('project')
        .where({ key })
        .update({ areaKey, lastUpdatedAt: new Date().toISOString() });

      if (projectId) {
        return await this.getProject(key);
      }
      log.error(`Failed to set area of project with key: ${key}`);
      throw new Error(`Failed to set area of project with key: ${key}`);
    } catch (err) {
      log.error(`Failed to set area of project with key: ${key} - ${err}`);
      throw err;
    }
  }

  /* AreaOrder */

  async getAreaOrders(): Promise<AreaOrderEntity[]> {
    log.debug(`Getting area orders`);
    return this.knex('areaOrder').select('*');
  }

  async getAreaOrder(areaKey: string): Promise<AreaOrderEntity> {
    log.debug(`Getting area order with area key: ${areaKey}`);
    try {
      const areaOrder = await this.knex('areaOrder')
        .select('*')
        .where({ areaKey })
        .first();
      return areaOrder;
    } catch (err) {
      log.error(`Failed to get areaOrder with key: ${areaKey} - ${err}`);
      throw err;
    }
  }

  async createAreaOrder(areaKey: string): Promise<AreaOrderEntity> {
    log.debug(`Creating area order with area key: ${areaKey}`);
    try {
      const maxSortOrder = await this.knex('areaOrder')
        .max('sortOrder as max')
        .first();

      const insertedId = await this.knex('areaOrder').insert({
        areaKey,
        sortOrder: maxSortOrder ? maxSortOrder?.max + 1 : 0,
      });
      if (!insertedId) {
        log.error(`Failed to create areaOrder with areaKey: ${areaKey}`);
        throw new Error(`Failed to create areaOrder with areaKey: ${areaKey}`);
      }

      return await this.getAreaOrder(areaKey);
    } catch (err) {
      log.error(`Failed to create areaOrder with key: ${areaKey} - ${err}`);
      throw err;
    }
  }

  async setAreaOrder(key: string, sortOrder: number): Promise<AreaOrderEntity> {
    log.debug(`Setting area order with key: ${key} to ${sortOrder}`);
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
      return await this.getAreaOrder(key);
    } catch (err) {
      log.error(`Failed to set areaOrder with key: ${key} - ${err}`);
      throw err;
    }
  }

  /* Areas */
  async getAreas(): Promise<AreaEntity[]> {
    log.debug(`Getting areas`);
    return this.knex('area').select('*');
  }

  async getArea(key: string): Promise<AreaEntity> {
    log.debug(`Getting area with key: ${key}`);
    try {
      return await this.knex('area').select('*').where({ key }).first();
    } catch (err) {
      log.error(`Failed to get area with key: ${key} - ${err}`);
      throw err;
    }
  }

  async createArea(
    key: string,
    name: string,
    description: string
  ): Promise<AreaEntity> {
    log.debug(
      `Creating area with key: ${key}, name: ${name}, description: ${description}`
    );
    try {
      const insertedId = await this.knex('area').insert({
        key,
        name,
        deleted: false,
        description,
        lastUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      if (insertedId) {
        this.createAreaOrder(key);
        this.createView(key, name, '', 'area');

        return await this.getArea(key);
      }
      log.error(`Failed to create area with key: ${key}`);
      throw new Error(`Failed to create area with key: ${key}`);
    } catch (err) {
      log.error(`Failed to create area with key: ${key} - ${err}`);
      throw err;
    }
  }

  async deleteArea(key: string): Promise<AreaEntity> {
    log.debug(`Deleting area with key: ${key}`);
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

  async renameArea(key: string, name: string): Promise<AreaEntity> {
    log.debug(`Renaming area with key: ${key} to ${name}`);
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

  async setDescriptionOfArea(
    key: string,
    description: string
  ): Promise<AreaEntity> {
    log.debug(`Setting description of area with key: ${key} to ${description}`);
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

  async setEmojiOfArea(key: string, emoji: string): Promise<AreaEntity> {
    log.debug(`Setting emoji of area with key: ${key} to ${emoji}`);
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
  async getItemOrders(): Promise<ItemOrderEntity[]> {
    return this.knex('itemOrder').select('*');
  }

  async getItemOrder(
    itemKey: string,
    componentKey: string
  ): Promise<ItemOrderEntity> {
    log.debug(
      `Getting itemOrder with itemKey: ${itemKey} and componentKey: ${componentKey}`
    );
    try {
      const itemOrder = await this.knex('itemOrder')
        .select('*')
        .where({ itemKey, componentKey })
        .first();
      if (!itemOrder) {
        log.error(`Failed to get itemOrder for key with key: ${itemKey}`);
        throw new Error(`ItemOrder with key: ${itemKey} not found`);
      }
      return itemOrder;
    } catch (err) {
      log.error(`Failed to get itemOrder with key: ${itemKey} - ${err}`);
      throw err;
    }
  }

  async getItemOrdersByItem(itemKey: string): Promise<ItemOrderEntity[]> {
    log.debug(`Getting itemOrders for item with key: ${itemKey}`);
    try {
      const itemOrders = await this.knex('itemOrder')
        .select('*')
        .where({ itemKey });
      if (!itemOrders) {
        log.error(`Failed to get itemOrders for item with key: ${itemKey}`);
        throw new Error(`ItemOrders with key: ${itemKey} not found`);
      }
      return itemOrders;
    } catch (err) {
      log.error(
        `Failed to get itemOrders for item with key: ${itemKey} - ${err}`
      );
      throw err;
    }
  }

  async getItemOrdersByComponent(
    componentKey: string
  ): Promise<ItemOrderEntity[]> {
    log.debug(`Getting itemOrders with componentKey: ${componentKey}`);
    try {
      const itemOrders = await this.knex('itemOrder')
        .select('*')
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
  ): Promise<ItemOrderEntity> {
    log.debug(
      `Creating itemOrder with itemKey: ${itemKey} and componentKey: ${componentKey}`
    );
    try {
      const maxSortOrder = await this.knex('itemOrder')
        .max('sortOrder as max')
        .first();

      const insertedId = await this.knex('itemOrder').insert({
        itemKey,
        componentKey,
        sortOrder: maxSortOrder ? maxSortOrder?.max + 1 : 0,
      });

      if (!insertedId) {
        log.error(
          `Failed to create itemOrder with itemKey: ${itemKey}, componentKey: ${componentKey}`
        );
        throw new Error(
          `Failed to create areaOrder with itemKey: ${itemKey}, componentKey: ${componentKey}`
        );
      }
      return await this.getItemOrder(itemKey, componentKey);
    } catch (err) {
      log.error(`Failed to create itemOrder with itemKey: ${itemKey} - ${err}`);
      throw err;
    }
  }

  async bulkCreateItemOrders(
    itemOrders: string[],
    componentKey: string
  ): Promise<ItemOrderEntity[]> {
    log.debug(`Bulk creating itemOrders with componentKey: ${componentKey}`);
    try {
      const maxSortOrder = await this.knex('itemOrder')
        .max('sortOrder as max')
        .where({ componentKey })
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
        itemOrders.map(async (i) => {
          return this.getItemOrder(i.toString(), componentKey);
        })
      );
    } catch (err) {
      log.error(`Failed to  bulk create itemOrders with itemKeys} - ${err}`);
      throw err;
    }
  }

  async setItemOrder(
    itemKey: string,
    componentKey: string,
    sortOrder: number
  ): Promise<ItemOrderEntity> {
    log.debug(
      `Setting itemOrder with itemKey: ${itemKey} and componentKey: ${componentKey} to sortOrder: ${sortOrder}`
    );
    try {
      const currentItemOrder = await this.getItemOrder(itemKey, componentKey);
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
      return await this.getItemOrder(itemKey, componentKey);
    } catch (err) {
      log.error(`Failed to set itemOrder with itemKey: ${itemKey} - ${err}`);
      throw err;
    }
  }

  async deleteItemOrders(itemKeys: string[], componentKey: string) {
    log.debug(
      `Deleting itemOrders with itemKeys: ${itemKeys} and componentKey: ${componentKey}`
    );
    const deletedIds = await this.knex('itemOrder')
      .whereIn('itemKey', itemKeys)
      .where({ componentKey })
      .delete();
    return deletedIds;
  }

  async deleteItemOrder(itemKey: string, componentKey: string) {
    log.debug(
      `Deleting itemOrder with itemKey: ${itemKey} and componentKey: ${componentKey}`
    );
    const deletedId = await this.knex('itemOrder')
      .where({ itemKey, componentKey })
      .delete();
    return deletedId;
  }

  async deleteItemOrdersByComponent(componentKey: string): Promise<string> {
    log.debug(`Deleting itemOrders with componentKey: ${componentKey}`);
    return (
      await this.knex('itemOrder').where({ componentKey }).delete()
    ).toString();
  }

  /* Items */

  async getItems(): Promise<ItemEntity[]> {
    log.debug('Getting items');
    return this.knex('item').select('*');
  }

  async getItem(key: string): Promise<ItemEntity> {
    log.debug(`Getting item with key: ${key}`);
    try {
      return await this.knex('item').select('*').where({ key }).first();
    } catch (err) {
      log.error(`Failed to get item with key: ${key} - ${err}`);
      throw err;
    }
  }

  async getItemsByProject(projectKey: string): Promise<ItemEntity[]> {
    log.debug(`Getting items with projectKey: ${projectKey}`);
    try {
      return await this.knex('item').select('*').where({ projectKey });
    } catch (err) {
      log.error(`Failed to get item with projectKey: ${projectKey} - ${err}`);
      throw err;
    }
  }

  async getItemsByArea(areaKey: string): Promise<ItemEntity[]> {
    log.debug(`Getting items with areaKey: ${areaKey}`);
    try {
      return await this.knex('item').select('*').where({ areaKey });
    } catch (err) {
      log.error(`Failed to get item with areaKey: ${areaKey} - ${err}`);
      throw err;
    }
  }

  async getItemsByParent(parentKey: string): Promise<ItemEntity[]> {
    log.debug(`Getting items with parentKey: ${parentKey}`);
    try {
      return await this.knex('item').select('*').where({ parentKey });
    } catch (err) {
      log.error(`Failed to get item with parentKey: ${parentKey} - ${err}`);
      throw err;
    }
  }

  async getItemsByFilter(
    filter: string,
    componentKey: string
  ): Promise<ItemEntity[]> {
    log.debug(
      `Getting items with filter: ${filter} and componentKey: ${componentKey}`
    );

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

    const orderKeys = orders.map((o) => o.itemKey);
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
    labelKey: string,
    parentKey: string,
    projectKey: string,
    repeat: string,
    text: string,
    type: string,
    dueAt?: Date,
    scheduledAt?: Date
  ): Promise<ItemEntity> {
    log.debug(
      `Creating item with key: ${key}, labelKey: ${labelKey}, parentKey: ${parentKey}, projectKey: ${projectKey}, repeat: ${repeat}, text: ${text}, type: ${type}, dueAt: ${dueAt}, scheduledAt: ${scheduledAt}`
    );
    try {
      // Get the parent to inherit some values
      const parent = parentKey ? await this.getItem(parentKey) : null;
      const areaKey = parent?.areaKey ? parent?.areaKey : null;
      const parentProjectKey = parent?.projectKey
        ? parent.projectKey
        : projectKey;

      const insertedId = await this.knex('item').insert({
        key,
        dueAt: dueAt?.toISOString() ?? null,
        labelKey,
        parentKey,
        projectKey: parentProjectKey ?? null,
        repeat,
        scheduledAt: scheduledAt?.toISOString() ?? null,
        text,
        areaKey,
        createdAt: new Date().toISOString(),
        type: 'TODO',
        deleted: false,
        completed: false,
      });

      if (insertedId) {
        return await this.knex('item')
          .select('*')
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

  async deleteItem(key: string): Promise<ItemEntity> {
    log.debug(`Deleting item with key: ${key}`);
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

  async restoreItem(key: string): Promise<ItemEntity> {
    log.debug(`Restoring item with key: ${key}`);
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

  async renameItem(key: string, text: string): Promise<ItemEntity> {
    log.debug(`Renaming item with key: ${key} to text: ${text}`);
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

  async completeItem(key: string): Promise<ItemEntity> {
    log.debug(`Completing item with key: ${key}`);
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

  async unCompleteItem(key: string): Promise<ItemEntity> {
    log.debug(`Uncompleting item with key: ${key}`);
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

  async setRepeatOfItem(key: string, repeat: string): Promise<ItemEntity> {
    log.debug(`Setting repeat of item with key: ${key} to ${repeat}`);
    try {
      const nextRepeatDate = repeat ? rrulestr(repeat).after(new Date()) : null;
      const updatedId = await this.knex('item')
        .where({ key })
        .update({
          repeat: repeat ?? null,
          dueAt: nextRepeatDate ? nextRepeatDate.toISOString() : null,
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

  async setProjectOfItem(key: string, projectKey: string): Promise<ItemEntity> {
    log.debug(`Setting project of item with key: ${key} to ${projectKey}`);
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
        return await this.getItem(key);
      }
      log.error(`Failed to set project of item without error`);
      throw new Error(`Failed to set project of item`);
    } catch (e) {
      log.error(`Failed to set project of item - ${e}`);
      throw e;
    }
  }

  async setAreaOfItem(key: string, areaKey: string): Promise<ItemEntity> {
    log.debug(`Setting area of item with key: ${key} to ${areaKey}`);
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
        return await this.getItem(key);
      }
      log.error('Failed to set area of item without error');
      throw new Error('Failed to set area of item');
    } catch (e) {
      log.error(`Failed to set area of item - ${e}`);
      throw e;
    }
  }

  async setScheduledAtOfItem(
    key: string,
    scheduledAt: Date
  ): Promise<ItemEntity> {
    log.debug(
      `Setting scheduled at of item with key: ${key} to ${scheduledAt}`
    );
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

  async setDueAtOfItem(key: string, dueAt: Date): Promise<ItemEntity> {
    log.debug(`Setting due at of item with key: ${key} to ${dueAt}`);
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

  async cloneItem(key: string): Promise<ItemEntity> {
    log.debug(`Cloning item with key: ${key}`);
    const newKey = uuidv4();
    const item = await this.getItem(key);
    return this.createItem(
      newKey,
      item.labelKey ?? '',
      item.parentKey ?? '',
      item.projectKey ?? '',
      item.repeat ?? '',
      item.text ?? '',
      'TODO',
      item.dueAt ? parseISO(item.dueAt) : undefined,
      item.scheduledAt ? parseISO(item.scheduledAt) : undefined
    );
  }

  async setParentOfItem(key: string, parentKey: string): Promise<ItemEntity> {
    log.debug(`Setting parent of item with key: ${key} to ${parentKey}`);
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
    log.debug(`Permanently deleting item with key: ${key}`);
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

  async setLabelOfItem(key: string, labelKey: string): Promise<ItemEntity> {
    log.debug(`Setting label of item with key: ${key} to ${labelKey}`);
    try {
      const updatedId = await this.knex('item').where({ key }).update({
        labelKey,
        lastUpdatedAt: new Date().toISOString(),
      });

      if (updatedId) {
        const children = await this.getItemsByParent(key);
        if (children.length) {
          await Promise.all(
            children.map(async (c) => {
              return this.setLabelOfItem(c.key, labelKey);
            })
          );
        }
        return await this.getItem(key);
      }
      log.error('Failed to set label of item without error');
      throw new Error('Failed to set label of item');
    } catch (e) {
      log.error(`Failed to set label of item - ${e}`);
      throw e;
    }
  }

  /* Features */
  async getFeatures(): Promise<FeatureEntity[]> {
    log.debug('Getting features');
    return this.knex('feature').select('*');
  }

  async getFeature(key: string): Promise<FeatureEntity> {
    log.debug(`Getting feature with key: ${key}`);
    try {
      const feature = await this.knex('feature')
        .select('*')
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

  async getFeatureByName(name: string): Promise<FeatureEntity> {
    log.debug(`Getting feature with name: ${name}`);
    try {
      const feature = await this.knex('feature')
        .select('*')
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

  async setFeature(key: string, enabled: boolean): Promise<FeatureEntity> {
    log.debug(`Setting feature with key: ${key} to ${enabled}`);
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
  ): Promise<FeatureEntity> {
    log.debug(`Setting feature metadata with key: ${key}`);
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
  ): Promise<FeatureEntity> {
    log.debug(
      `Creating feature with key: ${key}, name: ${name}, enabled: ${enabled}, metadata: ${JSON.stringify(
        metadata
      )}`
    );
    try {
      const insertedId = await this.knex('feature').insert({
        key,
        name,
        enabled,
        metadata,
      });

      if (insertedId) {
        return await this.knex('area')
          .select('*')
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

  async getLabels(): Promise<LabelEntity[]> {
    log.debug('Getting labels');
    try {
      return await this.knex('label').select('*');
    } catch (e) {
      log.error(`Failed to get labels - ${e}`);
      throw e;
    }
  }

  async getLabel(key: string): Promise<LabelEntity> {
    log.debug(`Getting label with key: ${key}`);
    try {
      const label = await this.knex('label').select('*').where({ key }).first();
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

  async createLabel(
    key: string,
    name: string,
    colour: string
  ): Promise<LabelEntity> {
    log.debug(
      `Creating label with key: ${key}, name: ${name}, colour: ${colour}`
    );
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

  async renameLabel(key: string, name: string): Promise<LabelEntity> {
    log.debug(`Renaming label with key: ${key} to ${name}`);
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

  async setColourOfLabel(key: string, colour: string): Promise<LabelEntity> {
    log.debug(`Setting colour of label with key: ${key} to ${colour}`);
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
    log.debug(`Deleting label with key: ${key}`);
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
  async getReminders(): Promise<ReminderEntity[]> {
    log.debug('Getting reminders');
    try {
      return await this.knex('reminder').select('*');
    } catch (e) {
      log.error(`Failed to get reminders - ${e}`);
      throw e;
    }
  }

  async getReminder(key: string): Promise<ReminderEntity> {
    log.debug(`Getting reminder with key: ${key}`);
    try {
      const reminder = await this.knex('reminder').where({ key }).first();
      return reminder;
    } catch (err) {
      log.error(`Failed to get reminder with key: ${key} - ${err}`);
      throw err;
    }
  }

  async getRemindersByItem(itemKey: string): Promise<ReminderEntity[]> {
    log.debug(`Getting reminders with item key: ${itemKey}`);
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
  ): Promise<ReminderEntity> {
    log.debug(
      `Creating reminder with key: ${key}, text: ${text}, remindAt: ${remindAt.toISOString()}, itemKey: ${itemKey}`
    );
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

  async deleteReminder(key: string): Promise<ReminderEntity> {
    log.debug(`Deleting reminder with key: ${key}`);
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

  async deleteReminderFromItem(itemKey: string): Promise<ReminderEntity> {
    log.debug(`Deleting reminders with item key: ${itemKey}`);
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
  async getComponents(): Promise<ComponentEntity[]> {
    log.debug('Getting components');
    try {
      return await this.knex('component').select('*');
    } catch (e) {
      log.error(`Failed to get components - ${e}`);
      throw e;
    }
  }

  async getComponent(key: string): Promise<ComponentEntity> {
    log.debug(`Getting component with key: ${key}`);
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

  async getComponentsByView(viewKey: string): Promise<ComponentEntity[]> {
    log.debug(`Getting components with view key: ${viewKey}`);
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
  ): Promise<ComponentEntity> {
    log.debug(
      `Creating component with key: ${key}, viewKey: ${viewKey}, location: ${location}, type: ${type}, parameters: ${JSON.stringify(
        parameters
      )}`
    );
    try {
      const insertedId = await this.knex('component').insert({
        key,
        viewKey,
        location,
        type,
        parameters: JSON.stringify(parameters),
      });

      if (insertedId) {
        await this.createComponentOrder(key);
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
  async cloneComponent(key: string): Promise<ComponentEntity> {
    log.debug(`Cloning component with key: ${key}`);
    try {
      const newKey = uuidv4();
      const component = await this.getComponent(key);
      if (component) {
        const newParams = component.parameters;

        // TODO: Make viewKey not null
        if (!component.viewKey) {
          log.error(`Failed to clone component due to missing viewKey`);
          throw new Error(`Failed to clone component due to missing viewKey`);
        }

        if (!component.location) {
          log.error(`Failed to clone component due to missing location`);
          throw new Error(`Failed to clone component due to missing location`);
        }

        if (!component.type) {
          log.error(`Failed to clone component due to missing type`);
          throw new Error(`Failed to clone component due to missing type`);
        }

        const newComponent = await this.createComponent(
          newKey,
          component.viewKey,
          component.location,
          component.type,
          newParams ?? {}
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
    log.debug(`Deleting component with key: ${key}`);
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
  ): Promise<ComponentEntity> {
    log.debug(
      `Setting parameters of component with key: ${key}, parameters: ${JSON.stringify(
        parameters
      )}`
    );
    try {
      const updatedId = await this.knex('component')
        .where({ key })
        .update({ parameters: JSON.stringify(parameters) });
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
    log.debug(
      `Updating component on project name change with viewKey: ${viewKey}, name: ${name}`
    );
    const components = await this.knex('component').where({
      viewKey,
      type: 'FilteredItemList',
    });
    components.forEach((component: ComponentEntity) => {
      if (!component.parameters) return;

      const params = component.parameters;
      if (!params) {
        log.error(
          `Failed to update component on project name change without error - no parameters found`
        );
        return;
      }

      try {
        // @ts-ignore
        const filter = JSON.parse(params?.filter);
        filter.text = filter.text.replace(
          /project = ".+"/,
          `project = "${name}"`
        );
        // @ts-ignore
        params.filter = JSON.stringify(filter);
        this.setParametersOfComponent(component.key, params);
      } catch (e) {
        log.error(
          `Failed to update component on project name change without error - ${e}`
        );
      }
    });
  }

  /* Component Order */
  async getComponentOrders(): Promise<ComponentOrderEntity[]> {
    log.debug('Getting component orders');
    try {
      return await this.knex('componentOrder').select('*');
    } catch (e) {
      log.error(`Failed to get component orders - ${e}`);
      throw e;
    }
  }

  async getComponentOrder(componentKey: string): Promise<ComponentOrderEntity> {
    log.debug(`Getting component order with component key: ${componentKey}`);
    try {
      const componentOrder = await this.knex('componentOrder')
        .where({ componentKey })
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

  async createComponentOrder(
    componentKey: string
  ): Promise<ComponentOrderEntity> {
    log.debug(`Creating component order with component key: ${componentKey}`);
    try {
      const maxSortOrder = await this.knex('componentOrder')
        .max('sortOrder as max')
        .first();

      const insertedId = await this.knex('componentOrder').insert({
        componentKey,
        sortOrder: maxSortOrder ? maxSortOrder?.max + 1 : 0,
      });

      if (insertedId) {
        return await this.getComponentOrder(componentKey);
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
    componentKey: string,
    sortOrder: number
  ): Promise<ComponentOrderEntity> {
    log.debug(
      `Setting component order with component key: ${componentKey}, sortOrder: ${sortOrder}`
    );
    try {
      const currentcomponentOrder = await this.getComponentOrder(componentKey);
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
        .where({ componentKey })
        .update({ sortOrder });
      if (updatedComponentOrderId) {
        return await this.getComponentOrder(componentKey);
      }
      log.error('Failed to set component order without error');
      throw new Error('Failed to set component order');
    } catch (e) {
      log.error(`Failed to set component order - ${e}`);
      throw e;
    }
  }

  /* Calendar */
  async getCalendars(): Promise<CalendarEntity[]> {
    log.debug(`Getting calendars`);
    return this.knex('calendar').select('*');
  }

  async getCalendar(key: string): Promise<CalendarEntity> {
    log.debug(`Getting calendar with key: ${key}`);
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

  async getActiveCalendar(): Promise<CalendarEntity> {
    log.debug('Getting active calendar');
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
  ): Promise<CalendarEntity> {
    log.debug(
      `Creating calendar with key: ${key}, name: ${name}, active: ${active}`
    );
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

  async deleteCalendar(key: string): Promise<CalendarEntity> {
    log.debug(`Deleting calendar with key: ${key}`);
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

  async setActiveCalendar(key: string): Promise<CalendarEntity> {
    log.debug(`Setting active calendar with key: ${key}`);
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

  async getEvents(): Promise<EventEntity[]> {
    log.debug(`Getting events`);
    try {
      const events = await this.knex('event').select('*');
      if (!events) {
        log.error(`Failed to get events`);
        throw new Error(`Failed to get events`);
      }
      try {
        return events.map((e) => ({
          ...e,
          attendees: JSON.parse(e.attendees),
        }));
      } catch (e) {
        log.error(`Failed to parse attendees for events `);
        throw new Error(`Failed to parse attendees for events`);
      }
    } catch (err) {
      log.error(`Failed to get events - ${err}`);
      throw err;
    }
  }

  async getEvent(key: string): Promise<Event> {
    log.debug(`Getting event with key: ${key}`);
    try {
      const event = await this.knex('event').where({ key }).first();
      if (event) {
        try {
          return { ...event, attendees: JSON.parse(event.attendees) };
        } catch (e) {
          log.error(`Failed to parse attendees for event with key: ${key}`);
          throw new Error(
            `Failed to parse attendees for event with key: ${key}`
          );
        }
      }
      log.error('Failed to get event without error');
      throw new Error('Failed to get event without error');
    } catch (err) {
      log.error(`Failed to get event with key: ${key} - ${err}`);
      throw err;
    }
  }

  async getEventsByCalendar(calendarKey: string): Promise<Event[]> {
    log.debug(`Getting events with calendar key: ${calendarKey}`);
    try {
      const events = await this.knex('event').where({ calendarKey });
      if (!events) {
        log.error(`Failed to get events with calendar key: ${calendarKey}`);
        throw new Error(
          `Failed to get events with calendar key: ${calendarKey}`
        );
      }
      try {
        return events.map((e) => ({
          ...e,
          attendees: JSON.parse(e.attendees),
        }));
      } catch (e) {
        log.error(
          `Failed to parse attendees for events from calendar: ${calendarKey}: ${e}`
        );
        throw new Error(
          `Failed to parse attendees for events from calendar: ${calendarKey}: ${e}`
        );
      }
    } catch (err) {
      log.error(
        `Failed to get events with calendar key: ${calendarKey} - ${err}`
      );
      throw err;
    }
  }

  async getEventsForActiveCalendar(): Promise<Event[]> {
    log.debug('Getting events for active calendar');
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
    log.debug(
      `Creating event with key: ${key}, title: ${title}, description: ${description}, startAt: ${startAt}, endAt: ${endAt}, allDay: ${allDay}, calendarKey: ${calendarKey}, location: ${location}, attendees: ${attendees}, recurrence: ${recurrence}`
    );
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
    log.debug(`Deleting event with key: ${key}`);
    try {
      return await this.knex('event').where({ key }).del();
    } catch (err) {
      log.error(`Failed to delete event with key: ${key} - ${err}`);
      throw err;
    }
  }

  /* Weekly goal */

  async getWeeklyGoals(): Promise<WeeklyGoalEntity[]> {
    log.debug(`Getting weekly goals`);
    return this.knex('weeklyGoal').select('*');
  }

  async getWeeklyGoal(key: string): Promise<WeeklyGoalEntity> {
    log.debug(`Getting weekly goal with key: ${key}`);
    try {
      return await this.knex('weeklyGoal').where({ key }).first();
    } catch (err) {
      log.error(`Failed to get weekly goal with key: ${key} - ${err}`);
      throw err;
    }
  }

  async getWeeklyGoalByName(name: string): Promise<WeeklyGoalEntity> {
    log.debug(`Getting weekly goal with name: ${name}`);
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
  ): Promise<WeeklyGoalEntity> {
    log.debug(
      `Creating weekly goal with key: ${key}, week: ${week}, goal: ${goal}`
    );
    try {
      const createdId = await this.knex('weeklyGoal')
        .insert({
          key,
          week,
          goal,
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
