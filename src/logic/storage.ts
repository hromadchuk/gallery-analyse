import { Preferences } from '@capacitor/preferences';

export async function setLocalCountries(codes: string[]) {
    try {
        await Preferences.set({ key: 'countries', value: JSON.stringify(codes) });
    } catch (error) {
        console.error('setLocalCountries error', error);
    }
}

export async function getLocalCountries(): Promise<string[]> {
    try {
        const countries = await Preferences.get({ key: 'countries' });

        if (countries.value) {
            return JSON.parse(countries.value);
        }
    } catch (error) {
        console.error('getLocalCountries error', error);
    }

    return [];
}
