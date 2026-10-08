import { createHashHistory, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    history: createHashHistory(),
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  })

  return router
}
