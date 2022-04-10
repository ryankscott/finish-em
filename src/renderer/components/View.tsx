import { ReactElement } from 'react';
import { useQuery } from '@apollo/client';
import { GET_VIEW } from 'renderer/queries';
import ReorderableComponentList from './ReorderableComponentList';
import Project from './Project';
import Area from './Area';
import Page from './Page';

type ViewProps = {
  viewKey: string;
};

// TODO: Need to migrate Areas to use views
const headerComponent = (type: string, viewKey: string) => {
  switch (type) {
    case 'project':
      return <Project projectKey={viewKey} />;
    case 'area':
      return <Area areaKey={viewKey} />;
    default:
      return <></>;
  }
};

const View = ({ viewKey }: ViewProps): ReactElement => {
  const { loading, error, data } = useQuery(GET_VIEW, {
    variables: {
      key: viewKey,
    },
  });
  if (loading) return <></>;
  if (error) {
    console.log(error);
    return <></>;
  }
  return (
    <Page>
      {headerComponent(data.view.type, viewKey)}
      <ReorderableComponentList viewKey={viewKey} />
    </Page>
  );
};

export default View;
