import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import QuickAdd from './QuickAdd';

const ViewManager = (props) => {
  const views = {
    main: <App />,
    quickAdd: <QuickAdd />,
  };

  const name = props.location.search.substr(1);
  if (name === '') {
    return view['main'];
  }

  const view = views[name];
  if (view === null) throw new Error("View '" + name + "' is undefined");

  return <Router>{views[view]}</Router>;
};

export default ViewManager;
