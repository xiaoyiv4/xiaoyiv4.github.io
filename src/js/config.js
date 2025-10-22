export const CONFIG = {
    selectors: {
        postsList: 'postsList',
        searchInput: 'searchInput',
        searchBtn: 'searchBtn',
        searchResults: 'searchResults',
        tagsList: 'tagsList',
        recentList: 'recentList',
        postCount: 'postCount',
        totalPost: 'totalPost',
        lastUpdated: 'lastUpdated',
        themeToggle: 'themeToggle'
    },
    endpoints: {
        articlesMetadata: './articles-metadata.json'
    },
    defaults: {
        latestArticlesCount: 5,
        descriptionLength: 100
    }
};