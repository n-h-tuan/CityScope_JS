import { Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import NotFoundView from './views/Errors/NotFoundView'
import GridEditor from './views/GridEditor'
import CityScopeJS from './views/CityScopeJS'
import ProjectionMapping from './views/ProjectionMapping'
import CityScopeJSMapCenter from './views/CityScopeJS/indexMapCenter'
import CityScopeJSChartSidebar from './views/CityScopeJS/indexChartSidebar'
import CityScopeJSOptionsMenu from './views/CityScopeJS/indexOptionsMenu'

const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <CityScopeJS /> },
      { path: '/onlyMap', element: <CityScopeJSMapCenter /> },
      { path: '/onlyChartSidebar', element: <CityScopeJSChartSidebar /> },
      { path: '/onlyOptionsMenu', element: <CityScopeJSOptionsMenu /> },
      { path: '/editor/', element: <GridEditor /> },
      { path: '/projection', element: <ProjectionMapping /> },
      { path: '/cityioviewer', element: <Navigate to="/" /> },

      { path: '*', element: <Navigate to="/404" /> },
      { path: '404', element: <NotFoundView /> },
    ],
  },
  // { path: '/onlyMap', element: <CityScopeJSMapCenter /> },
]

export default routes
