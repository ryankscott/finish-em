import { IconType as RIconType } from "react-icons";
import { BiSortAlt2 } from "react-icons/bi";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowRightCircle,
  FiBold,
  FiBox,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiCircle,
  FiClipboard,
  FiCopy,
  FiCornerLeftUp,
  FiEdit,
  FiEye,
  FiEyeOff,
  FiFlag,
  FiHelpCircle,
  FiInbox,
  FiItalic,
  FiLayers,
  FiLink,
  FiMenu,
  FiMoon,
  FiMoreVertical,
  FiPlus,
  FiRefreshCw,
  FiRepeat,
  FiRotateCcw,
  FiSave,
  FiSettings,
  FiSlash,
  FiSun,
  FiTag,
  FiTerminal,
  FiThumbsUp,
  FiTrash2,
  FiUnderline,
  FiUser,
  FiX,
} from "react-icons/fi";
import { GiFocusedLightning } from "react-icons/gi";
import { ImStrikethrough } from "react-icons/im";
import {
  MdAlarm,
  MdBlock,
  MdChecklist,
  MdColorLens,
  MdDragHandle,
  MdHourglassBottom,
  MdOutlineCalendarViewWeek,
  MdOutlineCloudDone,
  MdOutlineDeleteSweep,
  MdOutlineUnfoldLess,
  MdOutlineUnfoldMore,
  MdSort,
} from "react-icons/md";
import { RiBearSmileLine, RiZzzFill } from "react-icons/ri";
import { IconType } from "../interfaces";

export const convertSVGElementToReact = (svg: React.SVGProps<SVGElement>) => (
  <>{svg}</>
);

export const Icons: Record<IconType, RIconType> = {
  inbox: FiInbox,
  todoChecked: FiCheckCircle,
  todoUnchecked: FiCircle,
  trash: FiTrash2,
  upLevel: FiCornerLeftUp,
  repeat: FiRepeat,
  due: FiFlag,
  scheduled: FiCalendar,
  note: FiClipboard,
  add: FiPlus,
  close: FiX,
  expand: FiChevronRight,
  collapse: FiChevronDown,
  expandAll: MdOutlineUnfoldMore,
  collapseAll: MdOutlineUnfoldLess,
  stale: MdHourglassBottom,
  help: FiHelpCircle,
  label: FiTag,
  project: FiBox,
  area: FiLayers,
  show: FiEye,
  hide: FiEyeOff,
  restore: FiRotateCcw,
  trashPermanent: FiSlash,
  trashSweep: MdOutlineDeleteSweep,
  calendar: FiCalendar,
  more: FiMoreVertical,
  copy: FiCopy,
  move: FiArrowRightCircle,
  reminder: MdAlarm,
  feedback: FiThumbsUp,
  terminal: FiTerminal,
  colour: MdColorLens,
  slideLeft: FiChevronsLeft,
  slideRight: FiChevronsRight,
  settings: FiSettings,
  sort: MdSort,
  sortDirection: BiSortAlt2,
  back: FiArrowLeft,
  forward: FiArrowRight,
  subtask: MdChecklist,
  flag: MdBlock,
  edit: FiEdit,
  save: FiSave,
  view: FiLayers,
  drag: MdDragHandle,
  refresh: FiRefreshCw,
  notes: FiClipboard,
  weekly: MdOutlineCalendarViewWeek,
  todos: FiCheckCircle,
  lightMode: FiSun,
  darkMode: FiMoon,
  bear: RiBearSmileLine,
  snooze: RiZzzFill,
  zen: GiFocusedLightning,
  cloud: MdOutlineCloudDone,
  avatar: FiUser,
  menu: FiMenu,
  link: FiLink,
  bold: FiBold,
  italic: FiItalic,
  underline: FiUnderline,
  strike: ImStrikethrough,
};