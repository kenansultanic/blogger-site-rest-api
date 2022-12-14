const express = require('express');
const router = express.Router();
const pool = require('../database/database');
const util = require('../utils/util');


router.get('/api/posts/:slug', (req, res) => {
    pool.query(`SELECT * FROM blog_posts bp
                INNER JOIN tag_list tl on bp.slug = tl.slug
                WHERE tl.slug = $1`, [req.params.slug], (err, result) => {
                    if (err)
                        return res.status(500).json({message: 'Database error'});
                    if (result.rowCount === 0)
                        return res.status(404).json({message: 'Blog post not found'});
                    return res.status(200).json(util.parseBlogPost(result.rows));
             });
});

router.get('/api/posts', (req, res) => {
    let query = 'SELECT * FROM blog_posts bp INNER JOIN tag_list tl on bp.slug = tl.slug ';
    const params = [];
    if (req.query.tag) {
        query += 'WHERE bp.slug IN (SELECT slug FROM tag_list WHERE tag = $1) ';
        params.push(req.query.tag);
    }
    query += 'ORDER BY createdAt';
    pool.query(query, params, (err, result) => {
        if (err)
            return res.status(500).json({message: 'Database error'});
        return res.status(200).json(util.parseBlogPosts(result.rows));
    });
});

router.post('/api/posts', (req, res) => {
    const {title, description, body, tagList} = req.body?.blogPost;
    const slug = util.slugifyTitle(title);
    pool.query(`INSERT INTO blog_posts (slug, title, description, body, createdAt) 
                VALUES ($1, $2, $3, $4, NOW()) RETURNING createdAt`,
                [slug, title, description, body], (err, result) => {
                    if (err) {
                        if (err.code === '23505')
                            return res.status(409).json({message: 'Title already in use'});
                        else if (err.code === '23502')
                            return res.status(400).json({message: 'Missing a required field'});
                        return res.status(500).json({message: 'Database error'});
                    }
                    else {
                        const blogPost = {
                            slug,
                            ...req.body.blogPost,
                            createdAt: result.rows[0]?.createdat,
                            updatedAt: null
                        };
                        if (tagList.length > 0) {
                            let query = 'INSERT INTO tag_list (slug, tag) VALUES ';
                            tagList.forEach(tag => query += `('${slug}', '${tag}'),`);
                            pool.query(query.slice(0, -1), err => {
                                if (err)
                                    return res.status(500).json({message: 'Database error'});
                                return res.status(200).json({blogPost});
                            });
                        }
                        else res.status(200).json({blogPost});
                    }
                });
});

router.put('/api/posts/:slug', (req, res) => {
    let slug = req.params.slug;
    const {title, description, body} = req.body.blogPost;
    const params = [slug];
    let query = 'UPDATE blog_posts SET ';
    let counter = 2;
    if (title) {
        query += `slug = $${counter++}, title = $${counter++},`;
        slug = util.slugifyTitle(title);
        params.push(slug, title);
    }
    if (description) {
        query += `description = $${counter++},`;
        params.push(description);
    }
    if (body) {
        query += `body = $${counter},`;
        params.push(body);
    }
    query += ' updatedAt = NOW() WHERE slug = $1 RETURNING *';
    pool.query(query, params, (err, result) => {
        if (err) {
            if (err.code === '23505')
                return res.status(409).json({message: 'Title already in use'});
            return res.status(500).json({message: 'Database error'});
        }
        const blogPost = result.rows[0];
        pool.query('SELECT * FROM tag_list WHERE slug = $1', [slug], (err, result) => {
            if (err)
                return res.status(500).json({message: 'Database error'});
            return res.status(200).json({
                blogPost: {
                    ...blogPost, 
                    tagList: result.rows.map(item => item.tag)
                }});
        });
    });

});

router.delete('/api/posts/:slug', (req, res) => {
    pool.query('SELECT deletePost($1)', [req.params.slug], err => {
        if (err)
            return res.status(500).json({message: 'Database error'});
        return res.sendStatus(200);
    });
});

router.get('/api/tags', (req, res) => {
    pool.query('SELECT DISTINCT tag FROM tag_list', (err, result) => {
        if (err)
            return res.status(500).json({message: 'Database error'});
        return res.status(200).json({tags: result.rows.map(item => item.tag)});
    });
});

router.post('/api/posts/:slug/comments', (req, res) => {
    const comment = {
        slug: req.params.slug, 
        body: req.body.comment.body,
        updatedAt: null
    };
    pool.query(`INSERT INTO comments (slug, body, createdAt) VALUES 
                ($1, $2, NOW()) RETURNING createdAt, id`, [comment.slug, comment.body], (err, result) => {
                    if (err) {
                        console.log(err)
                        if (err.code === '23503')
                            return res.status(404).json({message: 'Nonexistent blog post'});
                        else if (err.code === '23502')
                            return res.status(400).json({message: 'Missing comment body'});
                        return res.status(500).json({message: 'Database error'});
                    }
                    comment.createdAt = result.rows[0].createdat;
                    comment.id = result.rows[0].id;
                    return res.status(200).json({comment});
                });
});

router.get('/api/posts/:slug/comments', (req, res) => {
    pool.query('SELECT * FROM comments WHERE slug = $1', [req.params.slug], (err, result) => {
        if (err)
            return res.status(500).json({message: 'Database error'});
        return res.status(200).json({comments: result.rows});
    });
});

router.delete('/api/posts/:slug/comments/:id', (req, res) => {
    pool.query('DELETE FROM comments WHERE id = $1', [req.params.id], err => {
        if (err)
            return res.status(500).json({message: 'Database error'});
        return res.sendStatus(200);
    });
});

module.exports = router;