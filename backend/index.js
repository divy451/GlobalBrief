import { MongoClient, ObjectId } from 'mongodb';
import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcryptjs';

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your_jwt_secret');

// Define CORS headers
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request) {
    // Handle CORS preflight (OPTIONS) requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      await client.connect();
      const db = client.db('news_db'); // Fixed database name to match wrangler.toml
      const articlesCollection = db.collection('articles');
      const usersCollection = db.collection('users');
      const url = new URL(request.url);
      const method = request.method;

      // Helper to authenticate token
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

      // Handle POST /api/auth/login
      if (url.pathname === '/api/auth/login' && method === 'POST') {
        const { username, password } = await request.json();
        const user = await usersCollection.findOne({ username });
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

      // Handle GET /api/news
      if (url.pathname === '/api/news' && method === 'GET') {
        const query = {};
        const urlQuery = url.searchParams;
        if (urlQuery.has('category')) query.category = urlQuery.get('category');
        if (urlQuery.has('isBreaking')) query.isBreaking = urlQuery.get('isBreaking') === 'true';
        let articlesQuery = articlesCollection.find(query);
        if (urlQuery.has('limit')) articlesQuery = articlesQuery.limit(Number(urlQuery.get('limit')));
        const articles = await articlesQuery.toArray();
        return new Response(JSON.stringify(articles), {
          headers: corsHeaders,
        });
      }

      // Handle GET /api/news/:id
      if (url.pathname.startsWith('/api/news/') && method === 'GET') {
        const id = url.pathname.split('/')[3];
        const article = await articlesCollection.findOne({ _id: new ObjectId(id) });
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

      // Handle POST /api/news (authenticated)
      if (url.pathname === '/api/news' && method === 'POST') {
        await authenticateToken(request.headers);
        const { title, content, category, author, excerpt, isBreaking } = await request.json();
        if (!title || !content || !category) {
          return new Response(JSON.stringify({ error: 'Title, content, and category are required' }), {
            status: 400,
            headers: corsHeaders,
          });
        }
        const articleData = {
          title,
          content,
          category,
          author: author || undefined,
          excerpt: excerpt || undefined,
          isBreaking: isBreaking === 'true' || isBreaking === true || false,
          date: new Date(),
        };
        const result = await articlesCollection.insertOne(articleData);
        const newArticle = await articlesCollection.findOne({ _id: result.insertedId });
        return new Response(JSON.stringify(newArticle), {
          status: 201,
          headers: corsHeaders,
        });
      }

      // Handle PUT /api/news/:id (authenticated)
      if (url.pathname.startsWith('/api/news/') && method === 'PUT') {
        await authenticateToken(request.headers);
        const id = url.pathname.split('/')[3];
        const { title, content, category, author, excerpt, isBreaking } = await request.json();
        const updateData = {
          title: title || undefined,
          content: content || undefined,
          category: category || undefined,
          author: author || undefined,
          excerpt: excerpt || undefined,
          isBreaking: isBreaking === 'true' || isBreaking === true || false,
        };
        const result = await articlesCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: 'after' }
        );
        if (!result.value) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404,
            headers: corsHeaders,
          });
        }
        return new Response(JSON.stringify(result.value), {
          headers: corsHeaders,
        });
      }

      // Handle DELETE /api/news/:id (authenticated)
      if (url.pathname.startsWith('/api/news/') && method === 'DELETE') {
        await authenticateToken(request.headers);
        const id = url.pathname.split('/')[3];
        const result = await articlesCollection.findOneAndDelete({ _id: new ObjectId(id) });
        if (!result.value) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404,
            headers: corsHeaders,
          });
        }
        return new Response(JSON.stringify({ message: 'Article deleted' }), {
          headers: corsHeaders,
        });
      }

      return new Response('Not Found', {
        status: 404,
        headers: corsHeaders,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || 'Server Error' }), {
        status: error.message === 'Access denied' || error.message === 'Invalid token' ? 401 : 500,
        headers: corsHeaders, // Ensure CORS headers are sent even on errors
      });
    } finally {
      await client.close();
    }
  },
};