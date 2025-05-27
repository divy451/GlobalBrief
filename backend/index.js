import { MongoClient, ObjectId } from 'mongodb';
import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcryptjs';

const MONGODB_URI = process.env.DATABASE_URL;
const JWT_SECRET_STRING = process.env.JWT_SECRET;

if (!MONGODB_URI) console.error("FATAL: DATABASE_URL not set.");
if (!JWT_SECRET_STRING) console.error("FATAL: JWT_SECRET not set.");

const client = new MongoClient(MONGODB_URI);
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING || 'fallback_secret');
let isConnected = false;

async function connectToMongoDB() {
  if (!isConnected) {
    console.log('Connecting to MongoDB...');
    if (!MONGODB_URI) throw new Error('MongoDB URI not configured.');
    try {
      await client.connect();
      console.log('MongoDB connected.');
      isConnected = true;
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      isConnected = false;
      throw error;
    }
  } else {
    console.log('Already connected to MongoDB.');
  }
}

export default {
  async fetch(request, env, ctx) {
    console.log(`Request: ${request.method} ${request.url}`);

    const allowedOrigin = 'https://briefly-6ef.pages.dev';
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      console.log('Handling OPTIONS request.');
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(JSON.stringify({ message: 'News API Worker running!' }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    try {
      await connectToMongoDB();
      const db = client.db();
      const articlesCollection = db.collection('articles');
      const usersCollection = db.collection('users');
      const method = request.method;

      const authenticateToken = async (reqHeaders) => {
        const authHeader = reqHeaders.get('authorization');
        if (!authHeader) throw { status: 401, message: 'Authorization header missing' };
        const tokenParts = authHeader.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
          throw { status: 401, message: 'Invalid token format' };
        }
        const token = tokenParts[1];
        try {
          const { payload } = await jwtVerify(token, JWT_SECRET);
          return payload;
        } catch (err) {
          throw { status: 401, message: 'Invalid or expired token' };
        }
      };

      // Proxy images to fix CORS
      if (url.pathname.startsWith('/api/images/') && method === 'GET') {
        const imageUrl = url.searchParams.get('url');
        if (!imageUrl) {
          return new Response(JSON.stringify({ error: 'Image URL required' }), {
            status: 400,
            headers: corsHeaders,
          });
        }
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
            status: 500,
            headers: corsHeaders,
          });
        }
        const imageHeaders = new Headers(imageResponse.headers);
        imageHeaders.set('Access-Control-Allow-Origin', allowedOrigin);
        return new Response(imageResponse.body, {
          status: imageResponse.status,
          headers: imageHeaders,
        });
      }

      // Login route
      if (url.pathname === '/api/auth/login' && method === 'POST') {
        let requestBody;
        try {
          requestBody = await request.json();
        } catch (e) {
          return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        const { username, password } = requestBody;
        if (!username || !password) {
          return new Response(JSON.stringify({ error: 'Username and password required' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        const user = await usersCollection.findOne({ username });
        if (!user) {
          return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
            status: 401,
            headers: corsHeaders,
          });
        }

        const isMatch = await compare(password, user.password);
        if (!isMatch) {
          return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
            status: 401,
            headers: corsHeaders,
          });
        }

        const token = await new SignJWT({ username: user.username, userId: user._id.toString() })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('1h')
          .sign(JWT_SECRET);

        return new Response(JSON.stringify({ token }), {
          status: 200,
          headers: corsHeaders,
        });
      }

      // Fetch all articles
      if (url.pathname === '/api/news' && method === 'GET') {
        const query = {};
        const urlQuery = url.searchParams;
        if (urlQuery.has('category')) query.category = urlQuery.get('category');
        if (urlQuery.has('isBreaking')) query.isBreaking = urlQuery.get('isBreaking') === 'true';

        let articlesQuery = articlesCollection.find(query).sort({ date: -1 });
        if (urlQuery.has('limit')) {
          const limit = Number(urlQuery.get('limit'));
          if (!isNaN(limit) && limit > 0) articlesQuery = articlesQuery.limit(limit);
        }

        const articles = await articlesQuery.toArray();
        return new Response(JSON.stringify(articles), {
          status: 200,
          headers: corsHeaders,
        });
      }

      // Fetch article by ID
      if (url.pathname.startsWith('/api/news/') && method === 'GET' && url.pathname.split('/').length === 4) {
        const id = url.pathname.split('/')[3];
        if (!ObjectId.isValid(id)) {
          return new Response(JSON.stringify({ error: 'Invalid article ID' }), {
            status: 400,
            headers: corsHeaders,
          });
        }
        const article = await articlesCollection.findOne({ _id: new ObjectId(id) });
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

      // Create article (authenticated)
      if (url.pathname === '/api/news' && method === 'POST') {
        await authenticateToken(request.headers);
        let articleData;
        try {
          articleData = await request.json();
        } catch (e) {
          return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        const { title, content, category, author, excerpt, isBreaking } = articleData;
        if (!title || !content || !category) {
          return new Response(JSON.stringify({ error: 'Title, content, and category required' }), {
            status: 400,
            headers: corsHeaders,
          });
        }
        const newArticleData = {
          title,
          content,
          category,
          author: author || 'Anonymous',
          excerpt: excerpt || content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          isBreaking: typeof isBreaking === 'boolean' ? isBreaking : false,
          date: new Date(),
        };
        const result = await articlesCollection.insertOne(newArticleData);
        const newArticle = { _id: result.insertedId, ...newArticleData };
        return new Response(JSON.stringify(newArticle), {
          status: 201,
          headers: corsHeaders,
        });
      }

      // Update article (authenticated)
      if (url.pathname.startsWith('/api/news/') && method === 'PUT' && url.pathname.split('/').length === 4) {
        await authenticateToken(request.headers);
        const id = url.pathname.split('/')[3];
        if (!ObjectId.isValid(id)) {
          return new Response(JSON.stringify({ error: 'Invalid article ID' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        let updateFields;
        try {
          updateFields = await request.json();
        } catch (e) {
          return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        delete updateFields._id;
        updateFields.lastUpdated = new Date();

        const result = await articlesCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateFields },
          { returnDocument: 'after' }
        );
        if (!result) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404,
            headers: corsHeaders,
          });
        }
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: corsHeaders,
        });
      }

      // Delete article (authenticated)
      if (url.pathname.startsWith('/api/news/') && method === 'DELETE' && url.pathname.split('/').length === 4) {
        await authenticateToken(request.headers);
        const id = url.pathname.split('/')[3];
        if (!ObjectId.isValid(id)) {
          return new Response(JSON.stringify({ error: 'Invalid article ID' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        const result = await articlesCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404,
            headers: corsHeaders,
          });
        }
        return new Response(JSON.stringify({ message: 'Article deleted' }), {
          status: 200,
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: corsHeaders,
      });

    } catch (error) {
      console.error('Error:', error.message);
      if (error.message.includes('Cannot use a session that has ended')) {
        isConnected = false;
        return new Response(JSON.stringify({ error: 'Database session error. Retry.' }), {
          status: 503,
          headers: corsHeaders,
        });
      }
      const status = error.status || 500;
      const message = error.message || 'Server error.';
      return new Response(JSON.stringify({ error: message }), {
        status: status,
        headers: corsHeaders,
      });
    }
  },
};