import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your_jwt_secret');

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function getArticleFromD1(d1, id) {
  const article = await d1.prepare("SELECT * FROM articles WHERE _id = ?").bind(id).first();
  return article || null;
}

async function getArticles(env, filter = {}) {
  const { NEWS_DB } = env;
  let query = "SELECT * FROM articles"; // Fetch all columns directly for better performance
  let bindings = [];
  let conditions = [];

  if (filter.category) {
    // Fetch article IDs from categories table
    const category = await NEWS_DB.prepare("SELECT article_ids FROM categories WHERE name = ?").bind(filter.category).first();
    if (!category || !JSON.parse(category.article_ids).length) {
      return [];
    }
    conditions.push("_id IN (SELECT value FROM json_each(?))");
    bindings.push(category.article_ids);
  } else if (filter.isBreaking) {
    // Fetch breaking news article IDs
    const breaking = await NEWS_DB.prepare("SELECT article_ids FROM breaking_news LIMIT 1").first();
    if (!breaking || !JSON.parse(breaking.article_ids).length) {
      return [];
    }
    conditions.push("_id IN (SELECT value FROM json_each(?))");
    bindings.push(breaking.article_ids);
  } else {
    // Default case: sort by date
    conditions.push("1=1"); // Placeholder for WHERE clause
  }

  // Add WHERE clause if conditions exist
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // Always sort by date descending
  query += " ORDER BY date DESC";

  // Implement pagination
  const page = Math.max(1, parseInt(filter.page) || 1);
  const limit = Math.min(50, parseInt(filter.limit) || 10); // Cap at 50 for performance
  const offset = (page - 1) * limit;
  query += " LIMIT ? OFFSET ?";
  bindings.push(limit, offset);

  const articles = await NEWS_DB.prepare(query).bind(...bindings).all();
  return articles.results || [];
}

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

      const d1 = env.NEWS_DB;
      if (!d1) {
        throw new Error('NEWS_DB binding is not available');
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
        const user = await d1.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
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
        const categories = await d1.prepare("SELECT name FROM categories").all();
        const categoryList = categories.results.map(row => {
          const categoryName = row.name;
          const slug = categoryName.replace(/\s+/g, '-');
          return {
            name: categoryName,
            path: `/category/${slug}`
          };
        });
        return new Response(JSON.stringify(categoryList), {
          headers: corsHeaders,
        });
      }

      if (normalizedPathname === '/api/news' && method === 'GET') {
        const urlQuery = url.searchParams;
        const filter = {
          category: urlQuery.get('category'),
          isBreaking: urlQuery.get('isBreaking') === 'true',
          limit: urlQuery.has('limit') ? Number(urlQuery.get('limit')) : undefined,
          page: urlQuery.has('page') ? Number(urlQuery.get('page')) : undefined,
        };
        const articles = await getArticles(env, filter);
        return new Response(JSON.stringify(articles), {
          headers: corsHeaders,
        });
      }

      if (normalizedPathname.startsWith('/api/news/') && method === 'GET') {
        const id = normalizedPathname.split('/')[3];
        const article = await getArticleFromD1(d1, id);
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
          _id: id,
          title: articleData.title,
          content: articleData.content,
          category: articleData.category,
          author: articleData.author || null,
          excerpt: articleData.excerpt || null,
          isBreaking: articleData.isBreaking === 'true' || articleData.isBreaking === true || false,
          date: new Date().toISOString(),
          image: articleData.image || null,
          imageCredit: articleData.imageCredit || null,
        };

        // Write to D1
        await d1.prepare(
          `INSERT INTO articles (_id, title, content, category, author, excerpt, isBreaking, date, image, imageCredit) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            id,
            fullArticleData.title,
            fullArticleData.content,
            fullArticleData.category,
            fullArticleData.author,
            fullArticleData.excerpt,
            fullArticleData.isBreaking ? 1 : 0,
            fullArticleData.date,
            fullArticleData.image,
            fullArticleData.imageCredit
          )
          .run();

        // Update category in D1
        const category = await d1.prepare("SELECT article_ids FROM categories WHERE name = ?").bind(articleData.category).first();
        let categoryList = category ? JSON.parse(category.article_ids) : [];
        if (!category) {
          await d1.prepare("INSERT INTO categories (name, article_ids) VALUES (?, '[]')").bind(articleData.category).run();
          categoryList = [];
        }
        categoryList.push(id);
        await d1.prepare("UPDATE categories SET article_ids = ? WHERE name = ?")
          .bind(JSON.stringify(categoryList), articleData.category)
          .run();

        // Update breaking news in D1
        if (fullArticleData.isBreaking) {
          const breaking = await d1.prepare("SELECT article_ids FROM breaking_news LIMIT 1").first();
          let breakingList = breaking ? JSON.parse(breaking.article_ids) : [];
          if (!breaking) {
            await d1.prepare("INSERT INTO breaking_news (article_ids) VALUES ('[]')").run();
            breakingList = [];
          }
          breakingList.push(id);
          await d1.prepare("UPDATE breaking_news SET article_ids = ? WHERE id = 1")
            .bind(JSON.stringify(breakingList))
            .run();
        }

        return new Response(JSON.stringify(fullArticleData), {
          status: 201,
          headers: corsHeaders,
        });
      }

      if (normalizedPathname.startsWith('/api/news/') && method === 'PUT') {
        await authenticateToken(request.headers);
        const id = normalizedPathname.split('/')[3];
        const existingArticle = await getArticleFromD1(d1, id);
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

        // Update in D1
        await d1.prepare(
          `UPDATE articles 
           SET title = ?, content = ?, category = ?, author = ?, excerpt = ?, isBreaking = ?, date = ?, image = ?, imageCredit = ? 
           WHERE _id = ?`
        )
          .bind(
            updatedArticle.title,
            updatedArticle.content,
            updatedArticle.category,
            updatedArticle.author,
            updatedArticle.excerpt,
            updatedArticle.isBreaking ? 1 : 0,
            updatedArticle.date,
            updatedArticle.image,
            updatedArticle.imageCredit,
            id
          )
          .run();

        // Update category in D1
        if (updatedData.category && updatedData.category !== oldCategory) {
          const oldCategoryData = await d1.prepare("SELECT article_ids FROM categories WHERE name = ?").bind(oldCategory).first();
          let oldCategoryList = oldCategoryData ? JSON.parse(oldCategoryData.article_ids) : [];
          oldCategoryList = oldCategoryList.filter(articleId => articleId !== id);
          await d1.prepare("UPDATE categories SET article_ids = ? WHERE name = ?")
            .bind(JSON.stringify(oldCategoryList), oldCategory)
            .run();

          const newCategoryData = await d1.prepare("SELECT article_ids FROM categories WHERE name = ?").bind(updatedData.category).first();
          let newCategoryList = newCategoryData ? JSON.parse(newCategoryData.article_ids) : [];
          if (!newCategoryData) {
            await d1.prepare("INSERT INTO categories (name, article_ids) VALUES (?, '[]')").bind(updatedData.category).run();
            newCategoryList = [];
          }
          newCategoryList.push(id);
          await d1.prepare("UPDATE categories SET article_ids = ? WHERE name = ?")
            .bind(JSON.stringify(newCategoryList), updatedData.category)
            .run();
        }

        // Update breaking news in D1
        if (updatedData.isBreaking !== undefined && (updatedData.isBreaking === 'true' || updatedData.isBreaking === true) !== oldIsBreaking) {
          const breaking = await d1.prepare("SELECT article_ids FROM breaking_news LIMIT 1").first();
          let breakingList = breaking ? JSON.parse(breaking.article_ids) : [];
          if (!breaking) {
            await d1.prepare("INSERT INTO breaking_news (article_ids) VALUES ('[]')").run();
            breakingList = [];
          }
          if (updatedArticle.isBreaking) {
            if (!breakingList.includes(id)) breakingList.push(id);
          } else {
            breakingList = breakingList.filter(articleId => articleId !== id);
          }
          await d1.prepare("UPDATE breaking_news SET article_ids = ? WHERE id = 1")
            .bind(JSON.stringify(breakingList))
            .run();
        }

        return new Response(JSON.stringify(updatedArticle), {
          headers: corsHeaders,
        });
      }

      if (normalizedPathname.startsWith('/api/news/') && method === 'DELETE') {
        await authenticateToken(request.headers);
        const id = normalizedPathname.split('/')[3];
        const article = await getArticleFromD1(d1, id);
        if (!article) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404,
            headers: corsHeaders,
          });
        }

        // Delete from D1
        await d1.prepare("DELETE FROM articles WHERE _id = ?").bind(id).run();

        // Update category in D1
        const categoryData = await d1.prepare("SELECT article_ids FROM categories WHERE name = ?").bind(article.category).first();
        let categoryList = categoryData ? JSON.parse(categoryData.article_ids) : [];
        categoryList = categoryList.filter(articleId => articleId !== id);
        await d1.prepare("UPDATE categories SET article_ids = ? WHERE name = ?")
          .bind(JSON.stringify(categoryList), article.category)
          .run();

        // Update breaking news in D1
        if (article.isBreaking) {
          const breaking = await d1.prepare("SELECT article_ids FROM breaking_news LIMIT 1").first();
          let breakingList = breaking ? JSON.parse(breaking.article_ids) : [];
          breakingList = breakingList.filter(articleId => articleId !== id);
          await d1.prepare("UPDATE breaking_news SET article_ids = ? WHERE id = 1")
            .bind(JSON.stringify(breakingList))
            .run();
        }

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

        const articles = (await d1.prepare("SELECT * FROM articles").all()).results || [];
        const users = (await d1.prepare("SELECT * FROM users").all()).results || [];

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