import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AuthService } from '../services/auth.service';

const authService = new AuthService()

passport.use(
    new GoogleStrategy({
            clientID: process.env.GCLIENT_ID!,
            clientSecret: process.env.GCLIENT_SECRET!,
            callbackURL: 'http://localhost:8080/auth/google/callback',
        }, async (accessToken, refreshToken, profile, done) => {
            try {
              // Check if the user already exists in the database
                const user = await authService.findUserByOAuthId(profile?.id)
                
              // if user does't exist  
                if(!user) {
                    const newUser = await authService.saveUser({
                        oauth_id: profile?.id, 
                        name: profile?.displayName, 
                        email: profile?.emails?.[0]?.value || "", 
                        avatar: profile?.photos?.[0]?.value 
                    })
                    // Return the new user object
                    return done(null, newUser);
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
    const typedUser = user as { oauth_id: string }; // Assert type
    done(null, typedUser.oauth_id);
});

  
// Deserialize user from the session
  passport.deserializeUser(async (oauth_id: string, done) => {
    const user = await authService.findUserByOAuthId(oauth_id)
    done(null, user);
  });
  
  export default passport;