import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret'; // Replace with your secret

const allowedOrigin = 'https://briefly-6ef.pages.dev';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
};

let client = null;
let db = null;

async function connectToDatabase() {
  if (db) return db;
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(process.env.DATABASE_URL, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    db = client.db('news_db');
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

function createToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '1h',
  });
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight (OPTIONS) requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname.replace(/^\/api/, '');

      // Connect to the database
      const database = await connectToDatabase();
      const articlesCollection = database.collection('articles');
      const usersCollection = database.collection('users');

      // Handle routes
      if (path === '/news' && request.method === 'GET') {
        const category = url.searchParams.get('category');
        const isBreaking = url.searchParams.get('isBreaking');
        const limit = parseInt(url.searchParams.get('limit')) || null;

        let query = {};
        if (category) query.category = category;
        if (isBreaking !== null) query.isBreaking = isBreaking === 'true';

        let articlesQuery = articlesCollection.find(query);
        if (limit) articlesQuery = articlesQuery.limit(limit);

        const articles = await articlesQuery.toArray();
        console.log(`Fetched ${articles.length} articles`);

        return new Response(JSON.stringify(articles), {
          status: 200,
          headers: corsHeaders,
        });
      }

      if (path.startsWith('/news/') && request.method === 'GET') {
        const id = path.split('/')[2];
        const article = await articlesCollection.findOne({ _id: id });
        if (!article) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404,
            headers: corsHeaders,
          });
        }
        return new Response(JSON.stringify(article), {
          status: 200,
          headers: corsHeaders,
        });
      }

      if (path === '/news' && request.method === 'POST') {
        const user = verifyToken(request);
        if (!user) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: corsHeaders,
          });
        }

        const data = await request.json();
        const article = {
          ...data,
          date: new Date().toISOString(),
          author: user.username,
        };
        const result = await articlesCollection.insertOne(article);
        return new Response(JSON.stringify({ id: result.insertedId, ...article }), {
          status: 201,
          headers: corsHeaders,
        });
      }

      if (path === '/login' && request.method === 'POST') {
        const { username, password } = await request.json();
        const user = await usersCollection.findOne({ username, password });
        if (!user) {
          return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
            status: 401,
            headers: corsHeaders,
          });
        }
        const token = createToken(user);
        return new Response(JSON.stringify({ token }), {
          status: 200,
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error('Global error:', error.message);
      return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
        status: 500,
        headers: corsHeaders, // Ensure CORS headers are sent even on errors
      });
    } finally {
      await closeDatabaseConnection();
    }
  },
};