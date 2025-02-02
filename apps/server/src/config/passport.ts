import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './prisma';

passport.use(
    new GoogleStrategy({
            clientID: process.env.GCLIENT_ID!,
            clientSecret: process.env.GCLIENT_SECRET!,
            callbackURL: 'http://localhost:8080/auth/google/callback',
        }, async (accessToken, refreshToken, profile, done) => {
            try {
              // Check if the user already exists in the database
              console.log(profile)
              let user = await prisma.user.findUnique({
                where: { oauth_id: profile.id },
              });
      
              if (!user) {
                // If the user doesn't exist, create a new user
                user = await prisma.user.create({
                  data: {
                    oauth_id: profile.id,
                    name: profile.displayName,
                    email: profile.emails?.[0].value || "",
                    avatar: profile.photos?.[0].value || null,
                  },
                });
              }
      
              // Return the user object
              done(null, user);
            } catch (error) {
            //   done(error, null);
            console.log(error)
            }
          }
        )
)

// Serialize user into the session
passport.serializeUser((user, done) => {
    // done(null, user.id);
  });
  
  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    // const user = await prisma.user.findUnique({ where: { id } });
    // done(null, user);
  });
  
  export default passport;