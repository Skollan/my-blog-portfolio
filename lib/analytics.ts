export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).umami) {
    (window as any).umami.track(eventName, eventData)
  }
}

// Events prédéfinis
export const analytics = {
  // Blog
  viewPost: (slug: string) => trackEvent('view_post', { slug }),
  searchBlog: (query: string) => trackEvent('search_blog', { query }),
  clickTag: (tag: string) => trackEvent('click_tag', { tag }),
  
  // Portfolio
  viewProject: (slug: string) => trackEvent('view_project', { slug }),
  clickProjectLink: (type: 'github' | 'live', project: string) => 
    trackEvent('click_project_link', { type, project }),
  
  // Contact
  submitContact: () => trackEvent('submit_contact'),
  
  // Newsletter
  subscribeNewsletter: () => trackEvent('subscribe_newsletter'),
  
  // Navigation
  clickNavLink: (page: string) => trackEvent('nav_click', { page }),
}