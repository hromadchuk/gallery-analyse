import { useEffect, useState } from 'react';
import { Button, Center, Container, Loader, MantineProvider, Text } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { Stat } from './panels/Stat.tsx';
import { checkAccess, getStat, ICalculationResult } from './logic/media';

import '@capacitor-community/safe-area';
import '@mantine/core/styles.css';
import './App.css';

type TContentType = 'loading' | 'no_permission' | 'calculation_error' | 'stat';

export default function App() {
    const colorScheme = useColorScheme();

    const [contentType, setContentType] = useState<TContentType>('loading');
    const [statResult, setStatResult] = useState<ICalculationResult | null>(null);

    useEffect(() => {
        checkAccess().then((isAccess) => {
            if (isAccess) {
                getStat()
                    .then((stat) => {
                        setStatResult(stat);
                        setContentType('stat');
                    })
                    .catch(() => {
                        setContentType('calculation_error');
                    });

                setContentType('stat');
            } else {
                setContentType('no_permission');
            }
        });
    }, []);

    return (
        <MantineProvider forceColorScheme={colorScheme}>
            <div className="safeAreaTop" />

            <Container>
                <Content type={contentType} statResult={statResult} />
            </Container>

            <div className="safeAreaBottom" />
        </MantineProvider>
    );
}

function Content({ type, statResult }: { type: TContentType; statResult: ICalculationResult | null }) {
    if (type === 'stat' && statResult) {
        return <Stat {...statResult} />;
    }

    if (type === 'no_permission') {
        return (
            <>
                <Center h={100} ta="center">
                    <Text c="dimmed">For the app to work, you need to allow access to all photos</Text>
                </Center>

                <Center>
                    <Button
                        fullWidth
                        onClick={() => {
                            NativeSettings.openIOS({
                                option: IOSSettings.App
                            });
                        }}
                    >
                        Open settings
                    </Button>
                </Center>
            </>
        );
    }

    if (type === 'calculation_error') {
        return (
            <Center h={100} ta="center">
                <Text c="dimmed">Statistics calculation error</Text>
            </Center>
        );
    }

    return (
        <Center h={500}>
            <Loader />
        </Center>
    );
}
