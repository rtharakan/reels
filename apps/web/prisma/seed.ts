import { PrismaClient } from '@prisma/client';
import { computeMatchScore } from '@reels/matching-engine';

const prisma = new PrismaClient();

const DEMO_FILMS = [
  { tmdbId: 680, title: 'Pulp Fiction', year: 1994, posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', genreIds: [53, 80] },
  { tmdbId: 550, title: 'Fight Club', year: 1999, posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', genreIds: [18] },
  { tmdbId: 155, title: 'The Dark Knight', year: 2008, posterPath: '/qJ2tW6WMUDux911BTUgMMmlSTOy.jpg', genreIds: [18, 28, 80, 53] },
  { tmdbId: 278, title: 'The Shawshank Redemption', year: 1994, posterPath: '/9cjIGRnKoRWDHNEB3xPBqj0melL.jpg', genreIds: [18, 80] },
  { tmdbId: 238, title: 'The Godfather', year: 1972, posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', genreIds: [18, 80] },
  { tmdbId: 13, title: 'Forrest Gump', year: 1994, posterPath: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', genreIds: [35, 18, 10749] },
  { tmdbId: 120, title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, posterPath: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', genreIds: [12, 14, 28] },
  { tmdbId: 603, title: 'The Matrix', year: 1999, posterPath: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', genreIds: [28, 878] },
  { tmdbId: 497, title: 'The Green Mile', year: 1999, posterPath: '/velWPhVMQeQKcxggNEU8YmIo52R.jpg', genreIds: [14, 18, 80] },
  { tmdbId: 769, title: 'GoodFellas', year: 1990, posterPath: '/aKuFiU82s5ISJDx7KKvBGKklMIB.jpg', genreIds: [18, 80] },
  { tmdbId: 346, title: 'Seven', year: 1995, posterPath: '/6yoghtyTpznpBik8EngEmJskVUO.jpg', genreIds: [80, 9648, 53] },
  { tmdbId: 807, title: 'Se7en', year: 1995, posterPath: '/6yoghtyTpznpBik8EngEmJskVUO.jpg', genreIds: [80, 9648, 53] },
  { tmdbId: 27205, title: 'Inception', year: 2010, posterPath: '/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', genreIds: [28, 878, 12] },
  { tmdbId: 244786, title: 'Whiplash', year: 2014, posterPath: '/7fn624j544nwdf1nnBbGkBCe7xo.jpg', genreIds: [18, 10402] },
  { tmdbId: 637, title: 'Life Is Beautiful', year: 1997, posterPath: '/74hLDKjD5aGYOotO6esUVaeISa2.jpg', genreIds: [35, 18] },
  { tmdbId: 389, title: '12 Angry Men', year: 1957, posterPath: '/ppd84D2i9W8jXmsyInGyihiSyqz.jpg', genreIds: [18] },
  { tmdbId: 122, title: 'The Lord of the Rings: The Return of the King', year: 2003, posterPath: '/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg', genreIds: [12, 14, 28] },
  { tmdbId: 568332, title: 'Everything Everywhere All at Once', year: 2022, posterPath: '/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg', genreIds: [28, 12, 878] },
  { tmdbId: 372058, title: 'Your Name.', year: 2016, posterPath: '/q2CtXYjV1Q7wSLita2k4ICpcUVZ.jpg', genreIds: [10749, 16, 18] },
  { tmdbId: 11216, title: 'Cinema Paradiso', year: 1988, posterPath: '/8SRUfRUi6x4LWc1VNLq9SAcYPUE.jpg', genreIds: [18, 10749] },
];

const DEMO_USERS = [
  {
    email: 'alice@demo.reels.app',
    name: 'Alice Chen',
    age: 24,
    location: 'San Francisco, CA',
    bio: 'Film school grad obsessed with Tarantino and Nolan. Looking for someone to argue about the best Christopher Nolan film with.',
    intent: 'BOTH' as const,
    prompts: [
      { question: "What's a film that changed your perspective?", answer: 'Eternal Sunshine of the Spotless Mind' },
      { question: 'Which director do you think is underrated?', answer: 'Denis Villeneuve before Dune' },
    ],
    filmIndices: [0, 1, 2, 3, 4, 5, 6, 7, 12, 13],
    topFilmIndices: [0, 2, 12, 13],
  },
  {
    email: 'bob@demo.reels.app',
    name: 'Bob Martinez',
    age: 28,
    location: 'Austin, TX',
    bio: 'Horror and sci-fi nerd. If it has practical effects, I am in.',
    intent: 'FRIENDS' as const,
    prompts: [
      { question: "What film could you watch on repeat?", answer: 'The Thing (1982)' },
    ],
    filmIndices: [0, 2, 3, 7, 8, 9, 10, 12, 17, 18],
    topFilmIndices: [7, 12, 17, 0],
  },
  {
    email: 'carol@demo.reels.app',
    name: 'Carol Okonkwo',
    age: 22,
    location: 'London, UK',
    bio: 'Animation and international cinema enthusiast. Studio Ghibli is my comfort zone.',
    intent: 'DATING' as const,
    prompts: [
      { question: "What's a film that changed your perspective?", answer: 'Parasite — it made me rethink everything about class' },
      { question: "What film could you watch on repeat?", answer: 'Spirited Away' },
    ],
    filmIndices: [5, 6, 13, 14, 15, 16, 17, 18, 19],
    topFilmIndices: [18, 19, 13, 14],
  },
  {
    email: 'david@demo.reels.app',
    name: 'David Park',
    age: 31,
    location: 'Seoul, South Korea',
    bio: 'Classic Hollywood + Korean cinema. Yes I have watched Parasite. Yes it deserved Best Picture.',
    intent: 'BOTH' as const,
    prompts: [
      { question: 'Which director do you think is underrated?', answer: 'Park Chan-wook — Oldboy is a masterpiece' },
    ],
    filmIndices: [0, 1, 3, 4, 8, 9, 10, 14, 15, 19],
    topFilmIndices: [3, 4, 15, 0],
  },
  {
    email: 'emma@demo.reels.app',
    name: 'Emma Thompson',
    age: 26,
    location: 'Toronto, Canada',
    bio: 'Filmmaker by day, cinephile by night. I watch at least 3 films a week.',
    intent: 'BOTH' as const,
    prompts: [
      { question: "What's a film that changed your perspective?", answer: 'Moonlight — absolutely heartbreaking and beautiful' },
      { question: "What film could you watch on repeat?", answer: 'Before Sunrise' },
      { question: 'Which director do you think is underrated?', answer: 'Chloé Zhao' },
    ],
    filmIndices: [0, 1, 2, 3, 5, 6, 7, 12, 13, 17],
    topFilmIndices: [13, 0, 12, 3],
  },
];

async function main() {
  console.log('Seeding database...');

  // Create films
  const films: Awaited<ReturnType<typeof prisma.film.upsert>>[] = [];
  for (const filmData of DEMO_FILMS) {
    const film = await prisma.film.upsert({
      where: { tmdbId: filmData.tmdbId },
      create: filmData,
      update: filmData,
    });
    films.push(film);
  }
  console.log(`Created ${films.length} films`);

  // Create users with profiles
  const users = [];
  for (const userData of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      create: {
        email: userData.email,
        name: userData.name,
        age: userData.age,
        location: userData.location,
        bio: userData.bio,
        intent: userData.intent,
        timezone: 'America/New_York',
        prompts: userData.prompts,
        topFilmIds: userData.topFilmIndices.map((i) => films[i]!.id),
        privacyPolicyConsentedAt: new Date(),
        onboardingCompletedAt: new Date(),
        profilePhotos: [],
      },
      update: {
        name: userData.name,
        age: userData.age,
        location: userData.location,
        bio: userData.bio,
        intent: userData.intent,
      },
    });
    users.push({ user, filmIndices: userData.filmIndices });
  }
  console.log(`Created ${users.length} users`);

  // Create watchlist entries
  for (const { user, filmIndices } of users) {
    for (const idx of filmIndices) {
      await prisma.watchlistEntry.upsert({
        where: { userId_filmId: { userId: user.id, filmId: films[idx]!.id } },
        create: { userId: user.id, filmId: films[idx]!.id },
        update: {},
      });
    }
  }
  console.log('Created watchlist entries');

  // Compute match scores between all pairs
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const userA = users[i]!;
      const userB = users[j]!;

      const filmIdsA = userA.filmIndices.map((idx) => films[idx]!.id);
      const filmIdsB = userB.filmIndices.map((idx) => films[idx]!.id);
      const genresA = userA.filmIndices.map((idx) => films[idx]!.genreIds);
      const genresB = userB.filmIndices.map((idx) => films[idx]!.genreIds);

      const score = computeMatchScore({
        userAFilmIds: filmIdsA,
        userAGenres: genresA,
        userBFilmIds: filmIdsB,
        userBGenres: genresB,
      });

      const scoreData = {
        filmOverlap: score.filmOverlap,
        genreSimilarity: score.genreSimilarity,
        totalScore: score.totalScore,
        sharedFilmIds: score.sharedFilmIds,
      };

      await prisma.matchScore.upsert({
        where: { userId_candidateId: { userId: userA.user.id, candidateId: userB.user.id } },
        create: { userId: userA.user.id, candidateId: userB.user.id, ...scoreData },
        update: scoreData,
      });

      await prisma.matchScore.upsert({
        where: { userId_candidateId: { userId: userB.user.id, candidateId: userA.user.id } },
        create: { userId: userB.user.id, candidateId: userA.user.id, ...scoreData },
        update: scoreData,
      });
    }
  }
  console.log('Computed match scores');

  console.log('\nSeed complete! Demo users:');
  for (const { user } of users) {
    console.log(`  - ${user.name} (${user.email})`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
