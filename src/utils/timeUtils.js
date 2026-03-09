export function getTimeOfDay() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'day';
    if (hour >= 17 && hour < 19) return 'afternoon';
    if (hour >= 19 && hour < 21) return 'dusk';
    return 'night';
}

export function formatDate(date) {
    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
    });
}

export function formatTime(date) {
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}
