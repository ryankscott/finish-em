import React, { ReactElement, useState } from 'react';
import { useMutation } from '@apollo/client';
import { Flex, useColorMode } from '@chakra-ui/react';
import { CLONE_COMPONENT, DELETE_COMPONENT } from 'renderer/queries';
import Button from './Button';

type ComponentActionProps = {
  children: JSX.Element;
  componentKey: string;
  readOnly?: boolean;
};

const ComponentActions = (props: ComponentActionProps): ReactElement => {
  const { colorMode } = useColorMode();
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cloneComponent] = useMutation(CLONE_COMPONENT, {
    refetchQueries: ['ComponentsByView'],
  });
  const [deleteComponent] = useMutation(DELETE_COMPONENT, {
    refetchQueries: ['ComponentsByView'],
  });
  let enterInterval: NodeJS.Timeout;
  let exitInterval: NodeJS.Timeout;

  if (props.readOnly) return <div>{props.children}</div>;

  return (
    <Flex
      position="relative"
      onMouseEnter={() => {
        enterInterval = setTimeout(() => setShowActions(true), 250);
        clearTimeout(exitInterval);
      }}
      onMouseLeave={() => {
        clearTimeout(enterInterval);
        exitInterval = setTimeout(() => setShowActions(false), 400);
      }}
    >
      {showActions && (
        <>
          <Flex
            bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
            direction="column"
            position="absolute"
            right="-38px"
            zIndex={9}
            border="1px solid"
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
            shadow="sm"
            p={0}
            borderRadius={5}
          >
            <Button
              size="md"
              icon="edit"
              variant="default"
              tooltipText="Edit component"
              onClick={() => {
                setIsEditing(true);
              }}
            />
            <Button
              size="md"
              icon="copy"
              variant="default"
              tooltipText="Clone component"
              onClick={() => {
                cloneComponent({ variables: { key: props.componentKey } });
              }}
            />
            <Button
              size="md"
              icon="move"
              variant="default"
              tooltipText="Move component"
              onClick={() => {
                console.log('move');
              }}
            />
            <Button
              size="md"
              icon="trash"
              variant="default"
              tooltipText="Delete component"
              onClick={() =>
                deleteComponent({ variables: { key: props.componentKey } })
              }
            />
          </Flex>
        </>
      )}
      {React.Children.map(props.children, (c) => {
        return React.cloneElement(props.children, {
          editing: isEditing,
          setEditing: setIsEditing,
        });
      })}
    </Flex>
  );
};

export default ComponentActions;
