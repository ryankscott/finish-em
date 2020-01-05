const styles = {
  mentionStyle: {
    display: "inline-block",
    position: "relative",
    fontSize: "16px",
    fontWeight: "normal",
    fontFamily: "Helvetica",
    color: "#FFFFFF",
    zIndex: 2,
    backgroundColor: "#ff9e80",
    border: "1px solid #ff8e80",
    borderRadius: "5px",
    padding: "3px 2px 2px 3px",
    margin: "11px 0px 0px -5px"
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
        fontSize: "14px",
        width: "60px"
      },

      item: {
        color: "#777777",
        margin: "0px",
        padding: "5px 0px 5px 5px",
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
