import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

const Dashboard = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Graph = React.lazy(() => import('./pages/Graph').then((m) => ({ default: m.GraphPage })));
const ApisList = React.lazy(() => import('./pages/ApisList').then((m) => ({ default: m.ApisList })));
const ApiDetail = React.lazy(() => import('./pages/ApiDetail').then((m) => ({ default: m.ApiDetail })));
const Notifications = React.lazy(() => import('./pages/Notifications').then((m) => ({ default: m.NotificationsPage })));
const TeamsList = React.lazy(() => import('./pages/TeamsList').then((m) => ({ default: m.TeamsList })));
const TeamView = React.lazy(() => import('./pages/TeamView').then((m) => ({ default: m.TeamViewPage })));
const Settings = React.lazy(() => import('./pages/Settings').then((m) => ({ default: m.SettingsPage })));
const Login = React.lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'graph', element: <Graph /> },
      { path: 'graph/:apiId', element: <Graph /> },
      { path: 'apis', element: <ApisList /> },
      { path: 'apis/:apiId', element: <ApiDetail /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'teams', element: <TeamsList /> },
      { path: 'team/:teamId', element: <TeamView /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
