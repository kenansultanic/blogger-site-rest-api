CREATE TABLE blog_posts
(
    slug        text primary key,
    title       text not null,
    description text not null,
    body        text not null,
    createdAt   timestamp,
    updatedAt   timestamp
);


CREATE TABLE tag_list
(
    slug text references blog_posts (slug),
    tag  text not null
);


CREATE TABLE comments
(
    id        serial primary key,
    slug      text references blog_posts (slug),
    createdAt timestamp not null,
    updatedAt timestamp,
    body      text not null
);


ALTER TABLE tag_list
    ADD CONSTRAINT cascade_fk
        FOREIGN KEY (slug)
            REFERENCES blog_posts (slug)
            ON UPDATE CASCADE;


ALTER TABLE comments
    ADD CONSTRAINT cascade_fk
        FOREIGN KEY (slug)
            REFERENCES blog_posts (slug)
            ON UPDATE CASCADE;


CREATE OR REPLACE FUNCTION deletePost(post_slug text) RETURNS VOID AS
$$
BEGIN
    DELETE FROM comments WHERE slug = post_slug;
    DELETE FROM tag_list WHERE slug = post_slug;
    DELETE FROM blog_posts WHERE slug = post_slug;
END;
$$
    LANGUAGE plpgsql;