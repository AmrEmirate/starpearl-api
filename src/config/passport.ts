import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import SocialAuthService from '../services/socialAuth.service';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await SocialAuthService.findOrCreateGoogleUser(profile);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
