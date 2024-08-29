import { useEffect, useState } from 'react';
import { Center, Grid, Group, Space, Table, Tabs, Text, Title } from '@mantine/core';
import { ICalculationResult } from '../logic/media.ts';
import { CountryFlag } from '../components/CountryFlag.tsx';
import { decline } from '../logic/helpers.ts';
import { getLocalCountries } from '../logic/storage.ts';
import { World } from '../components/World.tsx';

export function Stat({ mediaByCountries, mediaByYears, firstVisitedCountries }: ICalculationResult) {
    const [userCountries, setUserCountries] = useState<string[]>([]);

    useEffect(() => {
        getLocalCountries().then((list) => {
            setUserCountries(list);
        });
    }, []);

    return (
        <Tabs defaultValue="countries">
            <Space h="md" />
            <Tabs.List grow>
                <Tabs.Tab value="countries">Countries</Tabs.Tab>
                <Tabs.Tab value="stat">Stat</Tabs.Tab>
            </Tabs.List>
            <Space h="md" />

            <Tabs.Panel value="countries">
                {!userCountries.length && (
                    <Center h={100} ta="center">
                        <Text c="dimmed">No media with locations</Text>
                    </Center>
                )}

                {userCountries.length > 0 && (
                    <>
                        <Group justify="space-between">
                            <Title order={4}>
                                Visited {userCountries.length} {decline(userCountries.length, ['country', 'countries'])}
                            </Title>
                        </Group>

                        <Grid>
                            {userCountries.map((code) => (
                                <Grid.Col span={4} key={code}>
                                    <CountryFlag code={code} fullWidth={true} />
                                </Grid.Col>
                            ))}
                        </Grid>

                        <World />
                    </>
                )}
            </Tabs.Panel>

            <Tabs.Panel value="stat">
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Year</Table.Th>
                            <Table.Th>Media</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {mediaByYears.map(({ year, value }) => (
                            <Table.Tr key={year}>
                                <Table.Td>{year}</Table.Td>
                                <Table.Td>{value}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>

                <Space h="xl" />

                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Country</Table.Th>
                            <Table.Th>Media</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {mediaByCountries.map(({ code, value }) => (
                            <Table.Tr key={code}>
                                <Table.Td>
                                    <CountryFlag code={code} fullWidth={false} />
                                </Table.Td>
                                <Table.Td>{value}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>

                <Space h="xl" />

                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Country</Table.Th>
                            <Table.Th>First visit</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {firstVisitedCountries.map(({ code, day }) => (
                            <Table.Tr key={code}>
                                <Table.Td>
                                    <CountryFlag code={code} fullWidth={false} />
                                </Table.Td>
                                <Table.Td>{day}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Tabs.Panel>
        </Tabs>
    );
}
