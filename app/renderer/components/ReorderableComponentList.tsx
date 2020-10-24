import React, { ReactElement } from "react";
import { ThemeProvider, keyframes, css } from "../StyledComponents";

import { themes } from "../theme";
import { connect } from "react-redux";
import ViewHeader from "./ViewHeader";
import { MainComponents } from "../interfaces";
import FilteredItemList from "./FilteredItemList";
import Button from "./Button";
import {
  Container,
  DraggableList,
  DraggableContainer,
} from "./styled/ReorderableComponentList";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { reorderComponent, addComponent } from "../actions";
import { TransitionGroup, Transition } from "react-transition-group";
import CSS from "csstype";

interface OwnProps {
  id: string;
}
interface DispatchProps {
  reorderComponent: (id: string, destinationId: string) => void;
  addComponent: (viewId: string) => void;
}

interface StateProps {
  theme: string;
  components: MainComponents;
}
type ReorderableComponentListProps = StateProps & OwnProps & DispatchProps;
const ReorderableComponentList = (
  props: ReorderableComponentListProps
): ReactElement => {
  const theme = themes[props.theme];

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <DragDropContext
          onDragEnd={(e) => {
            props.reorderComponent(
              e.draggableId,
              props.components.order[e.destination.index]
            );
          }}
          style={{ width: "100%" }}
        >
          <Droppable droppableId={uuidv4()} type="COMPONENT">
            {(provided, snapshot) => (
              <DraggableList
                {...provided.droppableProps}
                ref={provided.innerRef}
                isDraggingOver={snapshot.isDraggingOver}
              >
                <TransitionGroup component={null}>
                  {Object.values(props.components.order).map((c, index) => {
                    const comp = props.components.components[c];
                    if (comp.location == "main" && comp.viewId == props.id) {
                      switch (comp.component.name) {
                        case "FilteredItemList":
                          return (
                            <Transition
                              key={c}
                              timeout={{
                                appear: 100,
                                enter: 100,
                                exit: 100,
                              }}
                            >
                              {(state) => {
                                return (
                                  <Draggable
                                    key={c}
                                    draggableId={c}
                                    index={index}
                                    isDragDisabled={true}
                                  >
                                    {(provided, snapshot) => (
                                      <DraggableContainer
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        key={"container-" + c}
                                        isDragging={snapshot.isDragging}
                                        draggableStyle={
                                          provided.draggableProps.style
                                        }
                                        state={state}
                                      >
                                        <FilteredItemList
                                          id={c}
                                          key={c}
                                          {...comp.component.props}
                                        />
                                      </DraggableContainer>
                                    )}
                                  </Draggable>
                                );
                              }}
                            </Transition>
                          );
                        case "ViewHeader":
                          return (
                            <Transition
                              key={c}
                              timeout={{
                                appear: 100,
                                enter: 100,
                                exit: 100,
                              }}
                            >
                              {(state) => {
                                return (
                                  <Draggable
                                    key={c}
                                    draggableId={c}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <DraggableContainer
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        key={"container-" + c}
                                        isDragging={snapshot.isDragging}
                                        draggableStyle={
                                          provided.draggableProps.style
                                        }
                                        state={state}
                                      >
                                        <ViewHeader
                                          key={c}
                                          id={c}
                                          {...comp.component.props}
                                        />
                                      </DraggableContainer>
                                    )}
                                  </Draggable>
                                );
                              }}
                            </Transition>
                          );
                      }
                    }
                  })}
                </TransitionGroup>
              </DraggableList>
            )}
          </Droppable>
        </DragDropContext>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: "10px",
          }}
        >
          <Button
            type={"default"}
            iconSize="14px"
            width="90px"
            icon={"add"}
            text={"Add list"}
            onClick={() => {
              props.addComponent(props.id);
            }}
          />
        </div>
      </Container>
    </ThemeProvider>
  );
};

const mapStateToProps = (state): StateProps => ({
  theme: state.ui.theme,
  components: state.ui.components,
});
const mapDispatchToProps = (dispatch): DispatchProps => ({
  reorderComponent: (id: string, destinationId: string) => {
    dispatch(reorderComponent(id, destinationId));
  },
  addComponent: (viewId: string) => {
    const id = uuidv4();
    dispatch(
      addComponent(id, viewId, "main", {
        name: "FilteredItemList",
        props: {
          id: id,
          listName: "New list",
          isFilterable: true,
          filter: "not (completed or deleted)",
          hideIcons: [],
        },
      })
    );
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReorderableComponentList);
