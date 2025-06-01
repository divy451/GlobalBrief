const { MongoClient } = require('mongodb');
const axios = require('axios');

const uri = 'mongodb+srv://piush:OwrbjzxrYDrF0Phe@cluster0.lx7yszv.mongodb.net/news_db';
const client = new MongoClient(uri);

// Cloudflare credentials
const ACCOUNT_ID = 'f0233b6ef0eae476b97dc6abc5a8c6de';
const API_TOKEN = 'OIqwLu9Fz5RDGqAu3b_oajrJVTtCz3CbjGslPe0N';
const NAMESPACE_ID = '414a988462364291b024ecd20a4c2536';

async function extractData() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('news_db');

        // Extract articles
        const articles = await db.collection('articles').find().toArray();
        console.log('Articles:', articles);

        // Extract categories (derived from articles)
        const categories = {};
        for (const article of articles) {
            const category = article.category;
            if (!categories[category]) categories[category] = [];
            categories[category].push(article._id.toString());
        }
        console.log('Categories:', categories);

        // Extract breaking news (derived from articles)
        const breaking = articles.filter(a => a.isBreaking).map(a => a._id.toString());
        console.log('Breaking News:', breaking);

        // Extract users
        const users = await db.collection('users').find().toArray();
        console.log('Users:', users);

        return { articles, categories, breaking, users };
    } finally {
        await client.close();
    }
}

async function writeToKV(data) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/bulk`;
    const headers = {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
    };

    // Prepare bulk write payload
    const kvPairs = [];

    // Articles
    for (const article of data.articles) {
        // Remove MongoDB-specific fields like __v and convert _id to string
        const cleanedArticle = { ...article, _id: article._id.toString(), __v: undefined, date: article.date.toISOString() };
        kvPairs.push({
            key: `news_db:articles:${article._id}`,
            value: JSON.stringify(cleanedArticle)
        });
    }

    // Categories
    for (const [category, articleIds] of Object.entries(data.categories)) {
        kvPairs.push({
            key: `news_db:categories:${category}`,
            value: JSON.stringify(articleIds)
        });
    }

    // Breaking news
    kvPairs.push({
        key: 'news_db:breaking',
        value: JSON.stringify(data.breaking)
    });

    // Users
    for (const user of data.users) {
        const cleanedUser = { ...user, _id: user._id.toString(), __v: undefined };
        kvPairs.push({
            key: `news_db:users:${user.username}`,
            value: JSON.stringify(cleanedUser)
        });
    }

    // Write to KV using bulk API
    try {
        const response = await axios.put(url, kvPairs, { headers });
        console.log('Successfully written to KV:', response.data);
    } catch (error) {
        console.error('Error writing to KV:', error.response ? error.response.data : error.message);
    }
}

async function migrate() {
    const data = await extractData();
    await writeToKV(data);
}

migrate().catch(console.error);