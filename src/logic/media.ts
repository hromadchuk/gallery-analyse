import { Feature, FeatureCollection, Point, Polygon } from 'geojson';
import { Media } from '@capacitor-community/media';
import { booleanPointInPolygon, point } from '@turf/turf';
import { getLocalCountries, setLocalCountries } from './storage.ts';

import GeoJson from '../assets/countries.json';

interface GeoJsonProperties {
    ISO_A2: string;
    ADMIN: string;
}

type GeoJsonData = FeatureCollection<Polygon, GeoJsonProperties>;

export interface ICalculationResult {
    newCountries: string[];
    mediaByCountries: {
        code: string;
        value: number;
    }[];
    mediaByYears: {
        year: number;
        value: number;
    }[];
    firstVisitedCountries: {
        code: string;
        day: string;
    }[];
}

export async function getStat(): Promise<ICalculationResult> {
    const result: ICalculationResult = {
        newCountries: [],
        mediaByCountries: [],
        mediaByYears: [],
        firstVisitedCountries: []
    };

    const savedCountries = await getLocalCountries();
    const { medias } = await Media.getMedias({
        quantity: 1_000_000,
        sort: [{ key: 'creationDate', ascending: false }],
        thumbnailWidth: 1,
        thumbnailHeight: 1,
        thumbnailQuality: 1
    });

    const mediaByCountries: { [key: string]: number } = {};
    const mediaByYears: { [key: number]: number } = {};
    const firstVisitedCountries: { [key: string]: Date } = {};

    medias.forEach((media) => {
        try {
            mediaByYears[new Date(media.creationDate).getFullYear()] =
                (mediaByYears[new Date(media.creationDate).getFullYear()] || 0) + 1;

            if (media.location) {
                const detectedPoint = point([media.location.longitude, media.location.latitude]);
                // @ts-ignore
                const country = findCountry(detectedPoint, GeoJson);

                if (country) {
                    firstVisitedCountries[country.ISO_A2] = new Date(media.creationDate);

                    if (!savedCountries.includes(country.ISO_A2)) {
                        result.newCountries.push(country.ISO_A2);
                        savedCountries.push(country.ISO_A2);
                    }

                    mediaByCountries[country.ISO_A2] = (mediaByCountries[country.ISO_A2] || 0) + 1;
                }
            }
        } catch (error) {
            // @ts-ignore
            console.error('error', error.message);
        }
    });

    const mediaByCountriesEntries = Object.entries(mediaByCountries).map(([code, value]) => ({ code, value }));
    const mediaByYearsEntries = Object.entries(mediaByYears).map(([year, value]) => ({ year: Number(year), value }));
    const firstVisitedCountriesEntries = Object.entries(firstVisitedCountries).map(([code, value]) => ({
        code,
        time: value.getTime(),
        day: value.toDateString()
    }));

    result.mediaByCountries = mediaByCountriesEntries.sort((a, b) => b.value - a.value);
    result.mediaByYears = mediaByYearsEntries.sort((a, b) => b.year - a.year);
    result.firstVisitedCountries = firstVisitedCountriesEntries
        .sort((a, b) => b.time - a.time)
        .map(({ code, day }) => ({ code, day }));

    await setLocalCountries(savedCountries);

    return result;
}

export async function checkAccess() {
    try {
        await Media.getMedias({});

        return true;
    } catch (error) {
        console.error('checkAccess error', error);
    }

    return false;
}

function findCountry(detectedPoint: Feature<Point, GeoJsonProperties>, geojson: GeoJsonData) {
    for (const feature of geojson.features) {
        if (booleanPointInPolygon(detectedPoint, feature)) {
            return feature.properties;
        }
    }

    return null;
}
