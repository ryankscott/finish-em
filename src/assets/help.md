## Items

### Creating an item
- All items must be prefixed with `TODO` or `NOTE` depending on the item type

## Components

### Filter Syntax 
Attributes:
*   `dueDate` - due date of an item
*   `scheduledDate` - scheduled date of an item
*   `createdAt` - date an item was created
*   `deleted` - is the item deleted
*   `completed` - is the item completed
*   `type` - "TODO" or "NOTE" depending on the item type

Functions:
*   `today(date)` - determines if the input date is today
*   `overdue(date)` - determines if the input date has past
*   `sameDay(date1, date2)` - determines if date1 and date2 are the same date
*   `thisWeek(date)` - determines if the input date is this week
*   `thisMonth(date)` - determines if the input date is this month
*   `daysFromToday(date)` - determines the number of days the date is from today
*   `getLabelId(name)` - gets the ID of a label by name

More syntax info [here](https://github.com/joewalnes/filtrex#expressions)



## Shortcuts


### App
<div style="display:flex;flex-direction:column;justify-content:center;align-items: center;width: 100%;">


| Name                   | Keys     |
| :--------------------- | :------- |
| Go to Project 1        | `a g 1`  |
| Go to Project 2        | `a g 2`  |
| Go to Project N        | `a g n`  |
| Go to next Project     | `a g ]`  |
| Go to previous Project | `a g [`  |
| Go to Daily Agenda     | `a g d`  |
| Go to Inbox            | `a g i`  |
| Go to Trash            | `a g t`  |
| Go to Stale            | `a g s`  |
| Go to Unscheduled      | `a g u`  |
| Go to Completed        | `a g c`  |
| Show Sidebar           | `a s s ` |
| Hide Sidebar           | `a s h ` |

</div>



### Item
<div style="display:flex;flex-direction:column;justify-content:center;align-items: center;width: 100%;">

| Name               | Keys    |
| :----------------- | :------ |
| Edit item          | `e`     |
| Set Scheduled date | `s`     |
| Set Due date       | `d`     |
| Create subtask     | `a`     |
| Complete item      | `c`     |
| Uncomplete item    | `u+c`   |
| Repeat item        | `r`     |
| Delete item        | `x`     |
| Undelete item      | `u+x`   |
| Move item          | `m`     |
| Toggle children    | `t`     |
| Next item          | `j`     |
| Previous item      | `k`     |
| Convert to subtask | `v`     |
| Set active item    | `space` |

</div>