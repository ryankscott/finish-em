import { useQuery } from '@apollo/client';
import { ReactElement } from 'react';
import { GET_VIEW_BY_KEY } from 'renderer/queries';
import Area from './Area';
import Page from './Page';
import Project from './Project';
import ReorderableComponentList from './ReorderableComponentList';
import Spinner from './Spinner';

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
  const { loading, error, data } = useQuery(GET_VIEW_BY_KEY, {
    variables: {
      key: viewKey,
    },
  });
  if (loading) return <Spinner />;
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
