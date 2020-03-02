export const keymap = {
  APP: {
    GO_TO_PROJECT_1: "g p 1",
    GO_TO_PROJECT_2: "g p 2",
    GO_TO_PROJECT_3: "g p 3",
    GO_TO_PROJECT_4: "g p 4",
    GO_TO_PROJECT_5: "g p 5",
    GO_TO_PROJECT_6: "g p 6",
    GO_TO_PROJECT_7: "g p 7",
    GO_TO_PROJECT_8: "g p 8",
    GO_TO_PROJECT_9: "g p 9",
    GO_TO_DAILY_AGENDA: "g p d",
    GO_TO_INBOX: ["g p i", "g+p+i"],
    GO_TO_TRASH: ["g p t", "g+p+t"],
    GO_TO_UNSCHEDULED: ["g p u", "g+p+u"],
    SHOW_SIDEBAR: ["s s b", "s+s+b", "["],
    HIDE_SIDEBAR: ["h s b", "h+s+b", "]"],
    TOGGLE_SHORTCUT_DIALOG: ["s s d", "s+s+d", "?", "shift+/"],
    SHOW_CREATE_PROJECT_DIALOG: "s c p",
    ESCAPE: "Escape"
  },
  ITEM: {
    SET_SCHEDULED_DATE: ["s c", "s+c"],
    SET_DUE_DATE: ["s d", "s+d"],
    CREATE_SUBTASK: ["c s", "c+s"],
    COMPLETE_ITEM: ["c i", "c+i"],
    UNCOMPLETE_ITEM: ["u i", "u+i"],
    REPEAT_ITEM: ["r i", "r+i"],
    DELETE_ITEM: ["d i", "d+i"],
    UNDELETE_ITEM: ["n i", "n+i"],
    EDIT_ITEM_DESCRIPTION: ["e i", "e+i"],
    MOVE_ITEM: ["m i", "m+i"],
    TOGGLE_CHILDREN: ["t i", "t+i"]
  }
};
