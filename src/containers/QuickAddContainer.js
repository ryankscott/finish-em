import { connect } from "react-redux";
import { createItem } from "../actions";
import QuickAdd from "../components/QuickAdd";

const mapStateToProps = (state, ownProps) => ({});
const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit: text => dispatch(createItem(text))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuickAdd);
