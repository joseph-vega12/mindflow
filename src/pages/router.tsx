import React, { FC } from 'react';
import { Route } from 'react-router-dom';
import { Routes, useLocation, Navigate } from 'react-router-dom';

import { useAuthContext } from 'lib/firebase';

import { BusinessLayout } from 'layouts/Business';
import { MainLayout } from 'layouts/Main';
import { OwnerLayout } from 'layouts/Owner';
import { PublicLayout } from 'layouts/Public';
import { ReportsLayout } from 'layouts/Reports';
import { PublicNewLayout } from 'layouts/PublicNew';

import { businessRoutes } from './business/routes';
import { mainRoutes } from './main/routes';
import { ownerReportsRoutes } from './ownerReports/routes';
import { ownerRoutes } from './owner/routes';
import publicRoutes from './public/routes';

export const PagesRouter: FC = (authoredProps) => {
  const { user } = useAuthContext();
  const { pathname } = useLocation();

  const renderRoute = (route: any) => {
    const { Component, path } = route;

    return (
      <Route
        key={path}
        path={path}
        element={<Component key={document.location.href} {...authoredProps} />}
      />
    );
  };

  if (pathname.startsWith('/free/program') || pathname.startsWith('/free/buy-program')) {
    return (
      <PublicNewLayout>
        <Routes>{publicRoutes.map(renderRoute)}</Routes>
      </PublicNewLayout>
    );
  }

  if (pathname.startsWith('/free')) {
    return (
      <PublicLayout>
        <Routes>{publicRoutes.map(renderRoute)}</Routes>
      </PublicLayout>
    );
  }

  // Guard against unauthenticated access
  if (!user) return <Navigate to="/login" />;

  // Authenticated layouts
  if (pathname.startsWith('/owner')) {
    return (
      <OwnerLayout>
        <Routes>{ownerRoutes.map(renderRoute)}</Routes>
      </OwnerLayout>
    );
  }

  if (pathname.startsWith('/reports')) {
    return (
      <ReportsLayout>
        <Routes>{ownerReportsRoutes.map(renderRoute)}</Routes>
      </ReportsLayout>
    );
  }

  if (pathname.startsWith('/business')) {
    return <Routes>{businessRoutes.map(renderRoute)}</Routes>;
  }

  // Default fallback layout
  return (
    <MainLayout {...authoredProps}>
      <Routes>{mainRoutes.map(renderRoute)}</Routes>
    </MainLayout>
  );
};
