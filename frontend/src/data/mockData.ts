
import { Article, Category, BreakingNewsItem } from "../types/news";

export const categories: Category[] = [
  { id: "1", name: "World", path: "/category/world" },
  { id: "2", name: "Politics", path: "/category/politics" },
  { id: "3", name: "Business", path: "/category/business" },
  { id: "4", name: "Technology", path: "/category/technology" },
  { id: "5", name: "Science", path: "/category/science" },
  { id: "6", name: "Health", path: "/category/health" },
  { id: "7", name: "Sports", path: "/category/sports" },
  { id: "8", name: "Entertainment", path: "/category/entertainment" },
];

export const breakingNews: BreakingNewsItem[] = [
  { 
    id: "1", 
    title: "Global summit on climate change concludes with new emission targets", 
    path: "/article/global-summit-climate-change" 
  },
  { 
    id: "2", 
    title: "Major tech companies announce joint AI ethics initiative", 
    path: "/article/tech-companies-ai-ethics" 
  },
  { 
    id: "3", 
    title: "Stock markets hit record highs amid economic recovery", 
    path: "/article/stock-markets-record-high" 
  },
];

export const featuredArticles: Article[] = [
  {
    id: "1",
    title: "World Leaders Gather to Address Climate Crisis at UN Summit",
    excerpt: "Representatives from 195 countries meet to discuss urgent actions needed to combat the growing climate emergency.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "World",
    date: "2023-11-15T09:00:00Z",
    author: "Sarah Johnson",
    path: "/article/world-leaders-climate-crisis"
  },
  {
    id: "2",
    title: "Revolutionary AI Technology Promises to Transform Healthcare Industry",
    excerpt: "New artificial intelligence system shows unprecedented accuracy in early disease detection, experts call it a game-changer.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Technology",
    date: "2023-11-14T14:30:00Z",
    author: "Michael Chen",
    path: "/article/ai-technology-healthcare"
  },
  {
    id: "3",
    title: "Global Economy Shows Signs of Recovery Despite Inflation Concerns",
    excerpt: "Economic indicators point to stronger-than-expected growth in Q3, but central banks remain cautious about inflation risks.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1607944024060-0450380ddd33?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Business",
    date: "2023-11-13T11:15:00Z",
    author: "David Wilson",
    path: "/article/global-economy-recovery"
  }
];

export const worldNews: Article[] = [
  {
    id: "4",
    title: "Peace Talks Resume in Middle East Conflict Zone",
    excerpt: "Diplomatic efforts intensify as regional powers support renewed negotiations to end the decade-long conflict.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1603826773225-14efcbeede6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "World",
    date: "2023-11-12T16:45:00Z",
    author: "Emily Rhodes",
    path: "/article/peace-talks-middle-east"
  },
  {
    id: "5",
    title: "European Union Announces New Digital Privacy Framework",
    excerpt: "Comprehensive regulations aim to strengthen data protection and establish new standards for tech companies.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1513552053577-921db2c8affb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "World",
    date: "2023-11-11T08:20:00Z",
    author: "Thomas Mueller",
    path: "/article/eu-privacy-framework"
  },
  {
    id: "6",
    title: "Humanitarian Crisis Unfolds as Natural Disaster Hits Island Nation",
    excerpt: "International aid organizations mobilize as thousands are displaced following devastating tropical cyclone.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1574765938886-029bea8d1a07?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "World",
    date: "2023-11-10T12:30:00Z",
    author: "Maria Santos",
    path: "/article/humanitarian-crisis-island"
  },
  {
    id: "7",
    title: "Historic Cultural Heritage Site Recognized by UNESCO",
    excerpt: "Ancient archaeological discovery receives world heritage status after decades of preservation efforts.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1517736996772-4b8891bff4e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "World",
    date: "2023-11-09T15:10:00Z",
    author: "Jonathan Lee",
    path: "/article/unesco-heritage-site"
  }
];

export const technologyNews: Article[] = [
  {
    id: "8",
    title: "Tech Giant Unveils Next-Generation Smartphone with Breakthrough Features",
    excerpt: "Industry-leading company introduces revolutionary device with enhanced AI capabilities and sustainable design.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1573551265922-620abe412c0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Technology",
    date: "2023-11-12T10:00:00Z",
    author: "Ryan Park",
    path: "/article/next-gen-smartphone"
  },
  {
    id: "9",
    title: "Cybersecurity Experts Warn of Sophisticated Ransomware Attacks",
    excerpt: "Growing threat landscape prompts calls for enhanced security measures across public and private sectors.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Technology",
    date: "2023-11-11T14:45:00Z",
    author: "Sophia Chen",
    path: "/article/ransomware-attacks-warning"
  },
  {
    id: "10",
    title: "Quantum Computing Milestone Achieved by Research Team",
    excerpt: "Scientists demonstrate practical application of quantum algorithms, bringing quantum advantage closer to reality.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Technology",
    date: "2023-11-10T09:30:00Z",
    author: "Daniel Kim",
    path: "/article/quantum-computing-milestone"
  },
  {
    id: "11",
    title: "Electric Vehicle Maker Announces Breakthrough Battery Technology",
    excerpt: "New battery promises longer range and faster charging times, potentially accelerating EV adoption worldwide.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1593941707882-a56bba8dbcc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Technology",
    date: "2023-11-09T13:15:00Z",
    author: "Jessica Walker",
    path: "/article/ev-battery-breakthrough"
  }
];

export const businessNews: Article[] = [
  {
    id: "12",
    title: "Major Corporate Merger Creates Industry Giant",
    excerpt: "Two leading companies join forces in a $50 billion deal that could reshape market competition.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1573164574511-73c773193279?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Business",
    date: "2023-11-12T08:00:00Z",
    author: "Robert Green",
    path: "/article/major-corporate-merger"
  },
  {
    id: "13",
    title: "Central Bank Adjusts Interest Rates Amid Inflation Concerns",
    excerpt: "Policy makers navigate economic challenges as inflation reaches highest level in five years.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Business",
    date: "2023-11-11T10:30:00Z",
    author: "Amanda Johnson",
    path: "/article/central-bank-rates"
  },
  {
    id: "14",
    title: "Start-up Secures Record Venture Capital Funding for Sustainable Technology",
    excerpt: "Green tech innovation attracts unprecedented investment as market shifts toward environmental solutions.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Business",
    date: "2023-11-10T15:45:00Z",
    author: "Kevin Zhang",
    path: "/article/startup-vc-funding"
  },
  {
    id: "15",
    title: "Global Supply Chain Disruptions Continue to Impact Manufacturing Sector",
    excerpt: "Companies implement new strategies to mitigate ongoing logistics challenges and material shortages.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Business",
    date: "2023-11-09T11:20:00Z",
    author: "Patricia Lee",
    path: "/article/supply-chain-disruptions"
  }
];

export const sportsNews: Article[] = [
  {
    id: "16",
    title: "Underdog Team Wins Championship in Stunning Upset",
    excerpt: "Against all odds, underdogs triumph in final match to claim their first title in team history.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Sports",
    date: "2023-11-12T22:30:00Z",
    author: "Mark Thompson",
    path: "/article/underdog-championship-win"
  },
  {
    id: "17",
    title: "Star Athlete Announces Retirement After Legendary Career",
    excerpt: "Sports icon reflects on two-decade journey and plans for future following emotional announcement.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Sports",
    date: "2023-11-11T18:15:00Z",
    author: "Steven Rodriguez",
    path: "/article/star-athlete-retirement"
  },
  {
    id: "18",
    title: "Olympic Committee Announces Host City for 2032 Summer Games",
    excerpt: "Selection culminates years of planning and proposals with ambitious sustainability commitments.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1568657335422-2ccd0a402be6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Sports",
    date: "2023-11-10T09:00:00Z",
    author: "Nicole White",
    path: "/article/olympic-host-city-2032"
  },
  {
    id: "19",
    title: "Record-Breaking Performance in World Championship Finals",
    excerpt: "Athlete shatters decade-old record in stunning display of skill and determination.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Sports",
    date: "2023-11-09T20:45:00Z",
    author: "Carlos Mendez",
    path: "/article/record-breaking-performance"
  }
];

export const trendingArticles: Article[] = [
  {
    id: "20",
    title: "Scientists Make Breakthrough in Cancer Treatment Research",
    excerpt: "New therapy shows promising results in early clinical trials with minimal side effects.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Health",
    date: "2023-11-14T08:30:00Z",
    author: "Dr. Rachel Kim",
    path: "/article/cancer-treatment-breakthrough"
  },
  {
    id: "21",
    title: "New Archaeological Discovery Changes Understanding of Ancient Civilization",
    excerpt: "Excavation uncovers evidence that rewrites historical timeline of sophisticated early society.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1442386968589-a136dd074bee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Science",
    date: "2023-11-13T14:00:00Z",
    author: "Professor James Miller",
    path: "/article/archaeological-discovery"
  },
  {
    id: "22",
    title: "Film Industry Embraces Sustainable Production Methods",
    excerpt: "Major studios commit to carbon-neutral filmmaking with innovative approaches to set design and transportation.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Entertainment",
    date: "2023-11-12T11:30:00Z",
    author: "Lisa Stewart",
    path: "/article/sustainable-film-production"
  },
  {
    id: "23",
    title: "Space Mission Successfully Collects Samples From Distant Asteroid",
    excerpt: "Scientists celebrate as spacecraft returns with valuable materials that could reveal solar system origins.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Science",
    date: "2023-11-11T16:15:00Z",
    author: "Dr. Alan Roberts",
    path: "/article/asteroid-sample-mission"
  },
  {
    id: "24",
    title: "Global Education Initiative Aims to Bridge Digital Divide",
    excerpt: "International partnership launches program to provide technology access to underserved communities.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, nisl nisl aliquam nisl, euismod nisl nisl eget fermentum aliquam.",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    category: "Education",
    date: "2023-11-10T09:45:00Z",
    author: "Michelle Torres",
    path: "/article/education-digital-divide"
  }
];
