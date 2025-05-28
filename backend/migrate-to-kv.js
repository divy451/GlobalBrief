const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const readline = require('readline');

async function migrateToKV() {
  try {
    // Process articles.json (JSON Lines format)
    const articles = [];
    const articlesStream = fs.createReadStream('articles.json');
    const articlesRl = readline.createInterface({
      input: articlesStream,
      crlfDelay: Infinity,
    });

    for await (const line of articlesRl) {
      if (line.trim()) { // Skip empty lines
        const article = JSON.parse(line);
        articles.push(article);
      }
    }
    console.log(`Found ${articles.length} articles to migrate.`);

    // Migrate articles
    for (const article of articles) {
      const id = article._id['$oid'] || article._id;
      const key = `news_db:articles:${id}`;
      const value = JSON.stringify({
        _id: id,
        title: article.title,
        content: article.content,
        category: article.category,
        date: article.date,
        author: article.author,
        excerpt: article.excerpt,
        isBreaking: article.isBreaking,
        image: article.image,
      });

      console.log(`Migrating article: ${key}`);
      await execPromise(`wrangler kv key put --binding NEWS_KV "${key}" '${value}'`);

      // Update category index
      const categoryKey = `news_db:categories:${article.category}`;
      let categoryList = [];
      try {
        const categoryData = await execPromise(`wrangler kv key get --binding NEWS_KV "${categoryKey}"`);
        categoryList = JSON.parse(categoryData.stdout || '[]');
      } catch (err) {
        // Key doesn't exist yet, start with an empty array
        categoryList = [];
      }
      if (!categoryList.includes(id)) categoryList.push(id);
      await execPromise(`wrangler kv key put --binding NEWS_KV "${categoryKey}" '${JSON.stringify(categoryList)}'`);

      // Update breaking news index
      if (article.isBreaking) {
        const breakingKey = `news_db:breaking`;
        let breakingList = [];
        try {
          const breakingData = await execPromise(`wrangler kv key get --binding NEWS_KV "${breakingKey}"`);
          breakingList = JSON.parse(breakingData.stdout || '[]');
        } catch (err) {
          // Key doesn't exist yet, start with an empty array
          breakingList = [];
        }
        if (!breakingList.includes(id)) breakingList.push(id);
        await execPromise(`wrangler kv key put --binding NEWS_KV "${breakingKey}" '${JSON.stringify(breakingList)}'`);
      }
    }

    // Process users.json (JSON Lines format)
    const users = [];
    const usersStream = fs.createReadStream('users.json');
    const usersRl = readline.createInterface({
      input: usersStream,
      crlfDelay: Infinity,
    });

    for await (const line of usersRl) {
      if (line.trim()) { // Skip empty lines
        const user = JSON.parse(line);
        users.push(user);
      }
    }
    console.log(`Found ${users.length} users to migrate.`);

    // Migrate users
    for (const user of users) {
      const username = user.username;
      const key = `news_db:users:${username}`;
      const value = JSON.stringify({
        _id: user._id['$oid'] || user._id,
        username: user.username,
        password: user.password,
      });

      console.log(`Migrating user: ${key}`);
      await execPromise(`wrangler kv key put --binding NEWS_KV "${key}" '${value}'`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateToKV();