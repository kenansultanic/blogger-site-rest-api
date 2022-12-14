const slugify = require('slugify');

const util = {
    slugifyTitle: title => slugify(title, {lower: true}),
    parseBlogPost: posts => {
        const tagList = [];
        const {tag, ...rest} = posts[0];
        posts.forEach(post => tagList.push(post?.tag));
        return {...rest, tagList};
    },
    parseBlogPosts: posts => {
        const blogPosts = [];
        let index = 0;
        while(index < posts.length) {
            const tagList = [];
            const {tag, ...rest} = posts[index];
            while(rest.slug === posts[index]?.slug) {
                tagList.push(posts[index].tag);
                index++;
            }
            blogPosts.push({...rest, tagList});
        }
        return {blogPosts, postsCount: blogPosts.length};
    }
};

module.exports = util;
