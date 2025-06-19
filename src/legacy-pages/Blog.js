import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Blog = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });
      setPosts(data || []);
    };
    fetchPosts();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Blog</h1>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((p) => (
          <article key={p.id} style={{ marginBottom: '2rem' }}>
            <h2>{p.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: p.content }} />
          </article>
        ))
      )}
    </div>
  );
};

export default Blog;
