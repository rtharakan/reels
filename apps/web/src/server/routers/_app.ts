import { router } from '../trpc';
import { userRouter } from './user';
import { watchlistRouter } from './watchlist';
import { discoverRouter } from './discover';
import { matchRouter } from './match';
import { safetyRouter } from './safety';
import { deviceRouter } from './device';
import { pickerRouter } from './picker';
import { moodRouter } from './mood';

export const appRouter = router({
  user: userRouter,
  watchlist: watchlistRouter,
  discover: discoverRouter,
  match: matchRouter,
  safety: safetyRouter,
  device: deviceRouter,
  picker: pickerRouter,
  mood: moodRouter,
});

export type AppRouter = typeof appRouter;
