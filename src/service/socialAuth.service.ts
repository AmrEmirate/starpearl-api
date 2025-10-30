import { prisma } from '../config/prisma';
import { User } from '../prisma/generated/client';
import ApiError from '../utils/apiError';

class SocialAuthService {
    private async findOrCreateUser(
        provider: string,
        profile: any,
        emailExtractor: (p: any) => string | undefined,
        photoExtractor: (p: any) => string | null
    ): Promise<User> {
        const existingUser = await prisma.user.findUnique({
            where: { provider_providerId: { provider, providerId: profile.id } },
        });

        if (existingUser) {
            return existingUser;
        }

        const email = emailExtractor(profile);
        if (!email) {
            throw new ApiError(400, `Email tidak dapat diambil dari profil ${provider}. Pastikan email Anda publik.`);
        }

        const userByEmail = await prisma.user.findUnique({ where: { email } });
        if (userByEmail) {
            throw new ApiError(409, 'Email sudah terdaftar dengan metode lain (misalnya, password). Silakan login dengan cara tersebut.');
        }

        return prisma.user.create({
            data: {
                email,
                fullName: profile.displayName,
                provider,
                providerId: profile.id,
                role: 'USER',
                verified: true, // Akun dari social auth dianggap sudah terverifikasi
                profilePicture: photoExtractor(profile),
            },
        });
    }

    public async findOrCreateGoogleUser(profile: any): Promise<User> {
        return this.findOrCreateUser(
            'google',
            profile,
            p => p.emails?.[0]?.value,
            p => p.photos?.[0]?.value
        );
    }

    public async findOrCreateFacebookUser(profile: any): Promise<User> {
        return this.findOrCreateUser(
            'facebook',
            profile,
            p => p.emails?.[0]?.value,
            p => p.photos?.[0]?.value ?? null
        );
    }

    public async findOrCreateTwitterUser(profile: any): Promise<User> {
        return this.findOrCreateUser(
            'twitter',
            profile,
            p => p.emails?.[0]?.value,
            p => p.photos?.[0]?.value.replace('_normal', '') ?? null
        );
    }
}

export default new SocialAuthService();