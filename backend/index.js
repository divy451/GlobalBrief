import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your_jwt_secret');

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const extractKeywords = (text) => {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 50)
  );
};

const updateSearchIndex = async (kv, articleId, title, content, oldKeywords = new Set()) => {
  const newKeywords = new Set([...extractKeywords(title), ...extractKeywords(content)]);
  
  for (const keyword of oldKeywords) {
    if (!newKeywords.has(keyword)) {
      const indexKey = `news_db:search_index:${keyword}`;
      let indexedIds = (await kv.get(indexKey, { type: 'json' })) || [];
      indexedIds = indexedIds.filter(id => id !== articleId);
      if (indexedIds.length > 0) {
        await kv.put(indexKey, JSON.stringify(indexedIds));
      } else {
        await kv.delete(indexKey);
      }
    }
  }

  for (const keyword of newKeywords) {
    if (!oldKeywords.has(keyword) || true) {
      const indexKey = `news_db:search_index:${keyword}`;
      let indexedIds = (await kv.get(indexKey, { type: 'json' })) || [];
      if (!indexedIds.includes(articleId)) {
        indexedIds.push(articleId);
        await kv.put(indexKey, JSON.stringify(indexedIds));
      }
    }
  }

  return newKeywords;
};

const removeFromSearchIndex = async (kv, articleId, title, content) => {
  const keywords = new Set([...extractKeywords(title), ...extractKeywords(content)]);
  for (const keyword of keywords) {
    const indexKey = `news_db:search_index:${keyword}`;
    let indexedIds = (await kv.get(indexKey, { type: 'json' })) || [];
    indexedIds = indexedIds.filter(id => id !== articleId);
    if (indexedIds.length > 0) {
      await kv.put(indexKey, JSON.stringify(indexedIds));
    } else {
      await kv.delete(indexKey);
    }
  }
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      const url = new URL(request.url);
      const method = request.method;

      const kv = env.NEWS_KV;
      if (!kv) {
        console.error('Error: NEWS_KV binding is undefined. Check wrangler.toml and deployment environment.');
        throw new Error('NEWS_KV binding is not available');
      }

      console.log(`Request received: ${method} ${url.pathname}${url.search}`);

      const authenticateToken = async (headers) => {
        const authHeader = headers.get('authorization');
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) throw new Error('Access denied');
        try {
          const { payload } = await jwtVerify(token, JWT_SECRET);
          return payload;
        } catch (err) {
          throw new Error('Invalid token');
        }
      };

      if (url.pathname === '/auth/login' && method === 'POST') {
        const { username, password } = await request.json();
        const user = await kv.get(`news_db:users:${username}`, { type: 'json' });
        if (!user) throw new Error('Invalid credentials');
        const isMatch = await compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');
        const token = await new SignJWT({ username: user.username })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('1h')
          .sign(JWT_SECRET);
        return new Response(JSON.stringify({ token }), {
          headers: corsHeaders,
        });
      }

      const normalizedPathname = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;

      if (normalizedPathname === '/api/categories' && method === 'GET') {
        console.log('Fetching all categories');
        const categoryKeys = await kv.list({ prefix: 'news_db:categories:' });
        const categories = categoryKeys.keys.map(key => {
          const categoryName = key.name.split(':')[2];
          const slug = categoryName.replace(/\s+/g, '-');
          return {
            name: categoryName,
            path: `/category/${slug}`
          };
        });

        console.log(`Categories fetched: ${JSON.stringify(categories)}`);

        return new Response(JSON.stringify(categories), {
          headers: corsHeaders,
        });
      }

      if (normalizedPathname === '/api/news' && method === 'GET') {
        try {
          const urlQuery = url.searchParams;
          let articleIds = [];

          if (urlQuery.has('category')) {
            const category = urlQuery.get('category');
            console.log(`Fetching articles for category: ${category}`);
            articleIds = (await kv.get(`news_db:categories:${category}`, { type: 'json' })) || [];
          } else if (urlQuery.has('isBreaking')) {
            const isBreaking = urlQuery.get('isBreaking') === 'true';
            if (isBreaking) {
              console.log('Fetching breaking news');
              articleIds = (await kv.get('news_db:breaking', { type: 'json' })) || [];
            }
          } else if (urlQuery.has('search')) {
            const searchTerm = urlQuery.get('search').toLowerCase();
            console.log(`Fetching articles for search term: ${searchTerm}`);
            const searchKeywords = Array.from(extractKeywords(searchTerm));
            if (searchKeywords.length === 0) {
              articleIds = [];
            } else {
              const keywordArticleIds = await Promise.all(
                searchKeywords.map(keyword =>
                  kv.get(`news_db:search_index:${keyword}`, { type: 'json' })
                )
              );
              let matchingArticleIds = keywordArticleIds[0] || [];
              for (let i = 1; i < keywordArticleIds.length; i++) {
                const currentIds = keywordArticleIds[i] || [];
                matchingArticleIds = matchingArticleIds.filter(id => currentIds.includes(id));
              }
              articleIds = matchingArticleIds;
            }
          } else {
            console.log('Fetching all articles');
            const keys = await kv.list({ prefix: 'news_db:articles:' });
            articleIds = keys.keys.map(key => key.name.split(':')[2]);
          }

          console.log(`Article IDs found: ${JSON.stringify(articleIds)}`);

          const limit = urlQuery.has('limit') ? Number(urlQuery.get('limit')) : articleIds.length;
          articleIds = articleIds.slice(0, limit);

          const articles = [];
          for (const id of articleIds) {
            const article = await kv.get(`news_db:articles:${id}`, { type: 'json' });
            if (article) articles.push(article);
          }

          console.log(`Articles fetched: ${JSON.stringify(articles)}`);

          return new Response(JSON.stringify(articles), {
            headers: corsHeaders,
          });
        } catch (error) {
          console.error(`Error in /api/news GET: ${error.message}`);
          return new Response(JSON.stringify({ error: 'Failed to fetch articles: ' + error.message }), {
            status: 500,
            headers: corsHeaders,
          });
        }
      }

      if (normalizedPathname.startsWith('/api/news/') && method === 'GET') {
        const id = normalizedPathname.split('/')[3];
        const article = await kv.get(`news_db:articles:${id}`, { type: 'json' });
        if (!article) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404,
            headers: corsHeaders,
          });
        }
        return new Response(JSON.stringify(article), {
          headers: corsHeaders,
        });
      }

      if (normalizedPathname === '/api/news' && method === 'POST') {
        await authenticateToken(request.headers);
        const articleData = await request.json();
        if (!articleData.title || !articleData.content || !articleData.category) {
          return new Response(JSON.stringify({ error: 'Title, content, and category are required' }), {
            status: 400,
            headers: corsHeaders,
          });
        }
        const id = crypto.randomUUID();
        const fullArticleData = {
          ...articleData,
          _id: id,
          date: new Date().toISOString(),
          isBreaking: articleData.isBreaking === 'true' || articleData.isBreaking === true || false,
        };

        await kv.put(`news_db:articles:${id}`, JSON.stringify(fullArticleData));

        const categoryKey = `news_db:categories:${articleData.category}`;
        const categoryList = (await kv.get(categoryKey, { type: 'json' })) || [];
        categoryList.push(id);
        await kv.put(categoryKey, JSON.stringify(categoryList));

        if (fullArticleData.isBreaking) {
          const breakingList = (await kv.get('news_db:breaking', { type: 'json' })) || [];
          breakingList.push(id);
          await kv.put('news_db:breaking', JSON.stringify(breakingList));
        }

        await updateSearchIndex(kv, id, fullArticleData.title, fullArticleData.content);

        return new Response(JSON.stringify(fullArticleData), {
          status: 201,
          headers: corsHeaders,
        });
      }

      if (normalizedPathname.startsWith('/api/news/') && method === 'PUT') {
        await authenticateToken(request.headers);
        const id = normalizedPathname.split('/')[3];
        const existingArticle = await kv.get(`news_db:articles:${id}`, { type: 'json' });
        if (!existingArticle) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404,
            headers: corsHeaders,
          });
        }
        const updatedData = await request.json();
        const oldCategory = existingArticle.category;
        const oldIsBreaking = existingArticle.isBreaking;

        const updatedArticle = {
          ...existingArticle,
          ...updatedData,
          isBreaking: updatedData.isBreaking !== undefined ? (updatedData.isBreaking === 'true' || updatedData.isBreaking === true) : existingArticle.isBreaking,
        };

        await kv.put(`news_db:articles:${id}`, JSON.stringify(updatedArticle));

        if (updatedData.category && updatedData.category !== oldCategory) {
          const oldCategoryList = (await kv.get(`news_db:categories:${oldCategory}`, { type: 'json' })) || [];
          await kv.put(`news_db:categories:${oldCategory}`, JSON.stringify(oldCategoryList.filter(articleId => articleId !== id)));
          const newCategoryList = (await kv.get(`news_db:categories:${updatedData.category}`, { type: 'json' })) || [];
          newCategoryList.push(id);
          await kv.put(`news_db:categories:${updatedData.category}`, JSON.stringify(newCategoryList));
        }

        if (updatedData.isBreaking !== undefined && (updatedData.isBreaking === 'true' || updatedData.isBreaking === true) !== oldIsBreaking) {
          let breakingList = (await kv.get('news_db:breaking', { type: 'json' })) || [];
          if (updatedArticle.isBreaking) {
            if (!breakingList.includes(id)) breakingList.push(id);
          } else {
            breakingList = breakingList.filter(articleId => articleId !== id);
          }
          await kv.put('news_db:breaking', JSON.stringify(breakingList));
        }

        const oldKeywords = new Set([
          ...extractKeywords(existingArticle.title),
          ...extractKeywords(existingArticle.content),
        ]);
        await updateSearchIndex(kv, id, updatedArticle.title, updatedArticle.content, oldKeywords);

        return new Response(JSON.stringify(updatedArticle), {
          headers: corsHeaders,
        });
      }

      if (normalizedPathname.startsWith('/api/news/') && method === 'DELETE') {
        await authenticateToken(request.headers);
        const id = normalizedPathname.split('/')[3];
        const article = await kv.get(`news_db:articles:${id}`, { type: 'json' });
        if (!article) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404,
            headers: corsHeaders,
          });
        }

        const categoryList = (await kv.get(`news_db:categories:${article.category}`, { type: 'json' })) || [];
        await kv.put(`news_db:categories:${article.category}`, JSON.stringify(categoryList.filter(articleId => articleId !== id)));

        if (article.isBreaking) {
          const breakingList = (await kv.get('news_db:breaking', { type: 'json' })) || [];
          await kv.put('news_db:breaking', JSON.stringify(breakingList.filter(articleId => articleId !== id)));
        }

        await removeFromSearchIndex(kv, id, article.title, article.content);

        await kv.delete(`news_db:articles:${id}`);

        return new Response(JSON.stringify({ message: 'Article deleted' }), {
          headers: corsHeaders,
        });
      }

      if (normalizedPathname === '/db' && method === 'GET') {
        if (env.ENVIRONMENT === 'production') {
          return new Response(JSON.stringify({ error: 'Endpoint not available in production' }), {
            status: 403,
            headers: corsHeaders,
          });
        }

        await authenticateToken(request.headers);

        const articleKeys = await kv.list({ prefix: 'news_db:articles:' });
        const articles = [];
        for (const key of articleKeys.keys) {
          const article = await kv.get(key.name, { type: 'json' });
          if (article) articles.push(article);
        }

        const userKeys = await kv.list({ prefix: 'news_db:users:' });
        const users = [];
        for (const key of userKeys.keys) {
          const user = await kv.get(key.name, { type: 'json' });
          if (user) users.push(user);
        }

        let html = `
          <html>
            <head>
              <title>News DB - Briefly Global</title>
              <style>
                table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { font-family: Arial, sans-serif; }
              </style>
            </head>
            <body>
              <h1>News DB - Articles</h1>
              <table>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Author</th>
                  <th>Excerpt</th>
                  <th>Is Breaking</th>
                  <th>Image Credit</th>
                </tr>
        `;
        for (const article of articles) {
          html += `
            <tr>
              <td>${article._id}</td>
              <td>${article.title}</td>
              <td>${article.category}</td>
              <td>${article.date}</td>
              <td>${article.author || 'Unknown'}</td>
              <td>${article.excerpt || ''}</td>
              <td>${article.isBreaking}</td>
              <td>${article.imageCredit || 'N/A'}</td>
            </tr>
          `;
        }
        html += `
              </table>
              <h1>News DB - Users</h1>
              <table>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                </tr>
        `;
        for (const user of users) {
          html += `
            <tr>
              <td>${user._id}</td>
              <td>${user.username}</td>
            </tr>
          `;
        }
        html += `
              </table>
            </body>
          </html>
        `;

        return new Response(html, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      if (url.pathname === '/' && method === 'GET') {
        return new Response(JSON.stringify({ message: "Welcome to the News API", status: "Operational" }), {
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error(`Server error: ${error.message}`);
      return new Response(JSON.stringify({ error: error.message || 'Server Error' }), {
        status: error.message === 'Access denied' || error.message === 'Invalid token' ? 401 : 500,
        headers: corsHeaders,
      });
    }
  },
};