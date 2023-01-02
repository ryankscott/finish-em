import { Resolvers } from "../resolvers-types";
import { DateTimeResolver, JSONResolver } from "graphql-scalars";
import area from "./area";
import feature from "./feature";
import item from "./item";
import project from "./project";
import view from "./view";
import label from "./label";
import reminder from "./reminder";
import component from "./component";
import areaOrder from "./areaOrder";
import viewOrder from "./viewOrder";
import projectOrder from "./projectOrder";
import itemOrder from "./itemOrder";
import componentOrder from "./componentOrder";
import calendar from "./calendar";
import event from "./event";
import weeklyGoal from "./weeklyGoal";
import user from "./user";

const resolvers: Resolvers = {
  Query: {
    ...item.Query,
    ...project.Query,
    ...area.Query,
    ...feature.Query,
    ...view.Query,
    ...areaOrder.Query,
    ...viewOrder.Query,
    ...projectOrder.Query,
    ...itemOrder.Query,
    ...label.Query,
    ...reminder.Query,
    ...component.Query,
    ...componentOrder.Query,
    ...calendar.Query,
    ...event.Query,
    ...weeklyGoal.Query,
    ...user.Query,
  },
  Mutation: {
    ...item.Mutation,
    ...project.Mutation,
    ...area.Mutation,
    ...feature.Mutation,
    ...view.Mutation,
    ...areaOrder.Mutation,
    ...viewOrder.Mutation,
    ...projectOrder.Mutation,
    ...itemOrder.Mutation,
    ...label.Mutation,
    ...reminder.Mutation,
    ...component.Mutation,
    ...componentOrder.Mutation,
    ...calendar.Mutation,
    ...event.Mutation,
    ...weeklyGoal.Mutation,
    ...user.Mutation,
  },
  Project: project.Project,
  Area: area.Area,
  Component: component.Component,
  Item: item.Item,
  ItemOrder: itemOrder.ItemOrder,
  DateTime: DateTimeResolver,
  JSON: JSONResolver,
  View: view.View,
  Calendar: calendar.Calendar,
};

export default resolvers;
