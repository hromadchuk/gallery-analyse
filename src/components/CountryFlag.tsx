import { useEffect, useState } from 'react';
import { Image } from '@mantine/core';

interface ICountryFlag {
    code: string;
    fullWidth: boolean;
}

export function CountryFlag({ code, fullWidth }: ICountryFlag) {
    const [imageSrc, setImageSrc] = useState<string>('');

    useEffect(() => {
        (async () => {
            try {
                const flag = await import(`../assets/flags/${code}.svg`);

                setImageSrc(flag.default);
            } catch (error) {
                console.error('Error load flag', error);

                const UNFlag = await import('../assets/flags/UN.svg');

                setImageSrc(UNFlag.default);
            }
        })();
    }, [code]);

    return <Image src={imageSrc} w={fullWidth ? '100%' : 'auto'} />;
}
