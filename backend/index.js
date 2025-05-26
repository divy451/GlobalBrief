import { MongoClient, ObjectId } from 'mongodb';
import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcryptjs';

const uri = process.env.DATABASE_URL; // Set in Cloudflare Workers environment
const client = new MongoClient(uri);
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your_jwt_secret');

export default {
  async fetch(request) {
    console.log('Request received:', request.url, request.method); // Log incoming request

    // Handle CORS preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
      console.log('Handling OPTIONS request for CORS preflight');
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400', // Cache preflight response for 24 hours
        },
      });
    }

    try {
      console.log('Connecting to MongoDB...');
      await client.connect();
      console.log('Connected to MongoDB');
      const db = client.db('news');
      const articlesCollection = db.collection('articles');
      const usersCollection = db.collection('users');
      const url = new URL(request.url);
      const method = request.method;
      console.log('Parsed URL pathname:', url.pathname); // Log the pathname

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

      // Handle POST /auth/login
      if (url.pathname === '/api/auth/login' && method === 'POST') {
        console.log('Handling POST /api/auth/login');
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
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // Handle GET /api/news
      if (url.pathname === '/api/news' && method === 'GET') {
        console.log('Handling GET /api/news');
        const query = {};
        const urlQuery = url.searchParams;
        if (urlQuery.has('category')) query.category = urlQuery.get('category');
        if (urlQuery.has('isBreaking')) query.isBreaking = urlQuery.get('isBreaking') === 'true';
        let articlesQuery = articlesCollection.find(query);
        if (urlQuery.has('limit')) articlesQuery = articlesQuery.limit(Number(urlQuery.get('limit')));
        const articles = await articlesQuery.toArray();
        console.log('Articles fetched:', articles);
        return new Response(JSON.stringify(articles), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // Handle GET /api/news/:id
      if (url.pathname.startsWith('/api/news/') && method === 'GET') {
        console.log('Handling GET /api/news/:id');
        const id = url.pathname.split('/')[3];
        const article = await articlesCollection.findOne({ _id: new ObjectId(id) });
        if (!article) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        return new Response(JSON.stringify(article), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // Handle POST /api/news (authenticated)
      if (url.pathname === '/api/news' && method === 'POST') {
        console.log('Handling POST /api/news');
        await authenticateToken(request.headers);
        const { title, content, category, author, excerpt, isBreaking } = await request.json();
        if (!title || !content || !category) {
          return new Response(JSON.stringify({ error: 'Title, content, and category are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // Handle PUT /api/news/:id (authenticated)
      if (url.pathname.startsWith('/api/news/') && method === 'PUT') {
        console.log('Handling PUT /api/news/:id');
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
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        return new Response(JSON.stringify(result.value), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // Handle DELETE /api/news/:id (authenticated)
      if (url.pathname.startsWith('/api/news/') && method === 'DELETE') {
        console.log('Handling DELETE /api/news/:id');
        await authenticateToken(request.headers);
        const id = url.pathname.split('/')[3];
        const result = await articlesCollection.findOneAndDelete({ _id: new ObjectId(id) });
        if (!result.value) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        return new Response(JSON.stringify({ message: 'Article deleted' }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      console.log('No matching route found');
      return new Response('Not Found', { 
        status: 404,
        headers: { 'Access-Control-Allow-Origin': '*' }, // Add CORS header to 404 response
      });
    } catch (error) {
      console.error('Backend error:', error.message || 'Unknown error');
      return new Response(JSON.stringify({ error: error.message || 'Server Error' }), {
        status: error.message === 'Access denied' || error.message === 'Invalid token' ? 401 : 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } finally {
      console.log('Closing MongoDB connection');
      await client.close();
    }
  },
};