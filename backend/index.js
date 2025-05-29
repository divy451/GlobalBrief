import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your_jwt_secret');

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

      // Log the incoming request URL and method
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
        const { title, content, category, author, excerpt, isBreaking, image } = await request.json();
        if (!title || !content || !category) {
          return new Response(JSON.stringify({ error: 'Title, content, and category are required' }), {
            status: 400,
            headers: corsHeaders,
          });
        }
        const id = crypto.randomUUID();
        const articleData = {
          _id: id,
          title,
          content,
          category,
          author: author || undefined,
          excerpt: excerpt || undefined,
          isBreaking: isBreaking === 'true' || isBreaking === true || false,
          date: new Date().toISOString(),
          image: image || undefined,
        };

        await kv.put(`news_db:articles:${id}`, JSON.stringify(articleData));

        const categoryKey = `news_db:categories:${category}`;
        const categoryList = (await kv.get(categoryKey, { type: 'json' })) || [];
        categoryList.push(id);
        await kv.put(categoryKey, JSON.stringify(categoryList));

        if (articleData.isBreaking) {
          const breakingList = (await kv.get('news_db:breaking', { type: 'json' })) || [];
          breakingList.push(id);
          await kv.put('news_db:breaking', JSON.stringify(breakingList));
        }

        return new Response(JSON.stringify(articleData), {
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
        const { title, content, category, author, excerpt, isBreaking, image } = await request.json();
        const oldCategory = existingArticle.category;
        const oldIsBreaking = existingArticle.isBreaking;

        const updatedArticle = {
          ...existingArticle,
          title: title || existingArticle.title,
          content: content || existingArticle.content,
          category: category || existingArticle.category,
          author: author || existingArticle.author,
          excerpt: excerpt || existingArticle.excerpt,
          isBreaking: isBreaking !== undefined ? (isBreaking === 'true' || isBreaking === true) : existingArticle.isBreaking,
          image: image || existingArticle.image,
        };

        await kv.put(`news_db:articles:${id}`, JSON.stringify(updatedArticle));

        if (category && category !== oldCategory) {
          const oldCategoryList = (await kv.get(`news_db:categories:${oldCategory}`, { type: 'json' })) || [];
          await kv.put(`news_db:categories:${oldCategory}`, JSON.stringify(oldCategoryList.filter(articleId => articleId !== id)));
          const newCategoryList = (await kv.get(`news_db:categories:${category}`, { type: 'json' })) || [];
          newCategoryList.push(id);
          await kv.put(`news_db:categories:${category}`, JSON.stringify(newCategoryList));
        }

        if (isBreaking !== undefined && (isBreaking === 'true' || isBreaking === true) !== oldIsBreaking) {
          let breakingList = (await kv.get('news_db:breaking', { type: 'json' })) || [];
          if (updatedArticle.isBreaking) {
            if (!breakingList.includes(id)) breakingList.push(id);
          } else {
            breakingList = breakingList.filter(articleId => articleId !== id);
          }
          await kv.put('news_db:breaking', JSON.stringify(breakingList));
        }

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