export function decline(number: number, titles: [string, string]): string {
    if ([0, 1].includes(number)) {
        return titles[0];
    }

    return titles[1];
}
