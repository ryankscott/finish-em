# Help 

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



