import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./prisma";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        const googleId = profile.id;
        const name = profile.displayName;
        const avatarUrl = profile.photos?.[0].value;

        if (!email) {
          return done(new Error("No email found from Google profile"));
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // If user exists but doesn't have googleId, update it
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId, avatarUrl: user.avatarUrl || avatarUrl },
            });
          }
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              email,
              name,
              googleId,
              avatarUrl,
              role: "BUYER", // Default role
              passwordHash: "", // No password for social login
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as any, false);
      }
    }
  )
);

export default passport;
