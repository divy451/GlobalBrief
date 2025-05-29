const { execSync } = require('child_process');

const articles = [
  {
    _id: "6815cfbb63590134be674b6c",
    title: "Pope Trump! U.S. President posts AI-generated image of himself dressed as pope",
    content: "U.S. President Donald Trump posted on Friday (May 2, 2025) a spoof picture of himself dressed as the pope...",
    category: "World",
    date: "2025-05-03T08:11:39.08Z",
    author: "Div",
    excerpt: "Donald Trump had joked to reporters that he would like to be the next pope...",
    isBreaking: false,
    image: "https://th-i.thgim.com/public/news/national/jyjvlw/article69533472.ece/alternates/FREE_1200/trump%20pope%20ai.jpeg"
  },
  // Add other articles here...
];

const users = [
  { _id: "prat754", username: "prat754", password: "$2a$10$hashedpasswordhere" }
];

console.log(`Found ${articles.length} articles to migrate.`);

articles.forEach(article => {
  console.log(`Migrating article: ${article._id}`);
  const articleKey = `news_db:articles:${article._id}`;
  execSync(`wrangler kv key put --binding NEWS_KV --remote "${articleKey}" '${JSON.stringify(article)}'`, { stdio: 'inherit' });

  const categoryKey = `news_db:categories:${article.category}`;
  const categoryList = JSON.parse(execSync(`wrangler kv key get --binding NEWS_KV --remote "${categoryKey}" || echo '[]'`, { encoding: 'utf8' })) || [];
  if (!categoryList.includes(article._id)) {
    categoryList.push(article._id);
    execSync(`wrangler kv key put --binding NEWS_KV --remote "${categoryKey}" '${JSON.stringify(categoryList)}'`, { stdio: 'inherit' });
  }

  if (article.isBreaking) {
    const breakingKey = `news_db:breaking`;
    const breakingList = JSON.parse(execSync(`wrangler kv key get --binding NEWS_KV --remote "${breakingKey}" || echo '[]'`, { encoding: 'utf8' })) || [];
    if (!breakingList.includes(article._id)) {
      breakingList.push(article._id);
      execSync(`wrangler kv key put --binding NEWS_KV --remote "${breakingKey}" '${JSON.stringify(breakingList)}'`, { stdio: 'inherit' });
    }
  }
});

console.log(`Found ${users.length} users to migrate.`);

users.forEach(user => {
  console.log(`Migrating user: ${user._id}`);
  const userKey = `news_db:users:${user._id}`;
  execSync(`wrangler kv key put --binding NEWS_KV --remote "${userKey}" '${JSON.stringify(user)}'`, { stdio: 'inherit' });
});

console.log("Migration completed successfully!");