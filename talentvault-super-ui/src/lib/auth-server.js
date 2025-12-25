import { cookies } from 'next/headers';

export const getAuthToken = () => cookies().get('tv_jwt')?.value || null;
