require('dotenv').config();
const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');

// Initialize Twitter client
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET
});

const rwClient = twitterClient.readWrite;

// Fetch tech news from NewsAPI
async function fetchTechNews() {
    try {
        const url = `https://newsapi.org/v2/top-headlines?category=technology&language=en&apiKey=${process.env.NEWS_API_KEY}`;
        const response = await axios.get(url);
        const articles = response.data.articles;
        return articles.slice(0, 1); // limit to first 3 articles
    } catch (error) {
        console.error("Error fetching news:", error.message);
        return [];
    }
}

// Post a tweet
async function postTweet(message) {
    try {
        const tweet = await rwClient.v2.tweet(message);
        console.log("Tweeted:", tweet.data.id);
    } catch (error) {
        console.error("Error posting tweet:", error.message);
    }
}

// Run the bot to fetch and tweet news
async function runBot() {
    console.log("Fetching tech news...");
    const articles = await fetchTechNews();
    for (let article of articles) {
        const title = article.title;
        const url = article.url;
        const message = `Breaking Tech News: ${title}\nRead more: ${url}`;
        await postTweet(message);
    }
}

// Schedule the bot to run every hour
cron.schedule('0 8 * * *', () => {
    console.log("Running scheduled tech news bot...");
    runBot();
});


// Run once immediately when starting the script
runBot();
