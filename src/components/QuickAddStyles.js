const styles = {
  itemMentionStyle: {
    display: "inline-block",
    position: "relative",
    fontSize: "16px",
    fontWeight: "normal",
    fontFamily: "Helvetica",
    textDecoration: "underline green",
    color: "green",
    zIndex: 2,
    margin: "13px 0px 0px -3px"
  },
  dateMentionStyle: {
    display: "inline-block",
    position: "relative",
    fontSize: "16px",
    fontWeight: "normal",
    fontFamily: "Helvetica",
    textDecoration: "underline blue",
    color: "blue",
    zIndex: 2,
    margin: "13px 0px 0px -6px"
  },
  mentionInputStyle: {
    control: {
      backgroundColor: "#fff",
      fontSize: "16px",
      fontFamily: "Helvetica",
      fontWeight: "normal"
    },

    highlighter: {
      overflow: "hidden"
    },

    input: {
      margin: "0px 0px 0px 0px",
      padding: "0px 0px 0px 10px",
      border: "1px solid #eee", // TODO: Remove me
      width: "100%",
      maxWidth: "800px",
      height: "50px",
      outline: "none"
    },

    suggestions: {
      list: {
        backgroundColor: "#FEFEFE",
        fontFamily: "Helvetica",
        borderRadius: "5px",
        border: "1px solid rgba(100,100,100,0.20)",
        fontSize: "14px"
      },

      item: {
        color: "#777777",
        margin: "0px",
        padding: "5px 5px 5px 5px",
        borderBottom: "1px solid rgba(100,100,100,0.25)",
        "&focused": {
          backgroundColor: "#ff9e80",
          color: "#FEFEFE",
          fontWeight: "normal",
          borderRadius: "5px 5px 5px 5px" // TODO: Fix this using first-child
        }
      }
    }
  }
};

export default styles;
